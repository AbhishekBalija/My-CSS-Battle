/**
 * CSSBattle approach contract
 *
 * The one set of rules for solution approaches, shared by the archive site,
 * its data validator and the cssbattle-tracker-extension publisher.
 * The extension keeps a byte-identical copy (extension/approach-contract.js)
 * and its CI fails if the two drift, so edit this file here first.
 *
 * Plain script with no imports: it attaches itself to the global object as
 * __cssbattleApproachContract, so the same file loads in Vite, Node scripts,
 * an extension service worker (importScripts) and node:vm tests.
 */

(function () {
  'use strict';

  const MAX_APPROACHES = 3;
  const LABEL_MAX = 80;
  const INSIGHT_MAX = 200;
  const MIRRORED_FIELDS = ['score', 'match', 'characters', 'timestamp', 'tags', 'code'];

  /**
   * Positive when the candidate is better: higher score first,
   * then fewer characters. Zero on an exact tie.
   */
  function compareApproaches(candidate, current) {
    if (candidate.score !== current.score) return candidate.score - current.score;
    if (candidate.characters !== current.characters) {
      return current.characters - candidate.characters;
    }
    return 0;
  }

  /** Best approach; on an exact tie the current best keeps winning. */
  function getBestApproach(approaches, currentBestId) {
    let best = approaches.find(approach => approach.id === currentBestId) || null;
    for (const approach of approaches) {
      if (!best || compareApproaches(approach, best) > 0) best = approach;
    }
    return best;
  }

  /** Labels compare case-insensitively after trimming. */
  function normalizeLabel(label) {
    return label.trim().toLocaleLowerCase('en');
  }

  /**
   * Cleans what the author typed: one line, trimmed.
   * Returns undefined when there is no insight to store.
   */
  function normalizeInsight(value) {
    if (typeof value !== 'string') return undefined;
    const insight = value.replace(/\s+/g, ' ').trim();
    return insight || undefined;
  }

  /** Copies the best approach's results to the record's top level. */
  function mirrorBestApproach(solution, approaches) {
    const best = getBestApproach(approaches, solution.bestApproachId);
    const mirrored = { ...solution, approaches, bestApproachId: best.id };
    for (const field of MIRRORED_FIELDS) mirrored[field] = best[field];
    return mirrored;
  }

  function isValidInsight(value) {
    return typeof value === 'string'
      && value === value.trim()
      && value.length >= 1
      && value.length <= INSIGHT_MAX
      && !/[\r\n]/.test(value);
  }

  function validateApproach(approach, prefix, ids, labels, errors) {
    if (typeof approach.id !== 'string' || approach.id.trim() === '') {
      errors.push(`${prefix}: id must be a non-empty string`);
    } else if (ids.has(approach.id)) {
      errors.push(`${prefix}: duplicate id ${JSON.stringify(approach.id)}`);
    } else {
      ids.add(approach.id);
    }

    const label = typeof approach.label === 'string' ? normalizeLabel(approach.label) : '';
    if (!label || approach.label.length > LABEL_MAX || approach.label !== approach.label.trim()) {
      errors.push(`${prefix}: label must be trimmed and contain 1-${LABEL_MAX} characters`);
    } else if (labels.has(label)) {
      errors.push(`${prefix}: duplicate label ${JSON.stringify(approach.label)}`);
    } else {
      labels.add(label);
    }

    if (Object.hasOwn(approach, 'insight') && !isValidInsight(approach.insight)) {
      errors.push(`${prefix}: insight must be trimmed plain text with 1-${INSIGHT_MAX} characters`);
    }

    for (const field of ['score', 'match', 'characters']) {
      if (typeof approach[field] !== 'number' || !Number.isFinite(approach[field])) {
        errors.push(`${prefix}: ${field} must be a finite number`);
      }
    }
    if (typeof approach.code !== 'string' || approach.code.length === 0) {
      errors.push(`${prefix}: code must be a non-empty string`);
    }
    if (typeof approach.timestamp !== 'string' || approach.timestamp.length === 0) {
      errors.push(`${prefix}: timestamp must be a non-empty string`);
    }
    if (!Array.isArray(approach.tags)) {
      errors.push(`${prefix}: tags must be an array`);
    }
  }

  /**
   * Checks one solution record. Returns error messages; [] means valid.
   * Legacy records (no approaches) are always valid.
   */
  function validateSolutionRecord(record) {
    const errors = [];
    const hasApproaches = Object.hasOwn(record, 'approaches');
    const hasBestId = Object.hasOwn(record, 'bestApproachId');

    if (!hasApproaches && !hasBestId) return errors;
    if (!hasApproaches || !hasBestId) {
      errors.push('approaches and bestApproachId must be stored together');
      return errors;
    }
    if (!Array.isArray(record.approaches) || record.approaches.length === 0) {
      errors.push('approaches must be a non-empty array');
      return errors;
    }
    if (record.approaches.length > MAX_APPROACHES) {
      errors.push(`approaches cannot contain more than ${MAX_APPROACHES} items`);
    }

    const ids = new Set();
    const labels = new Set();
    record.approaches.forEach((approach, index) => {
      validateApproach(approach, `approach ${index + 1}`, ids, labels, errors);
    });

    const best = getBestApproach(record.approaches, record.bestApproachId);
    if (record.bestApproachId !== best.id) {
      errors.push(`bestApproachId must point to ${JSON.stringify(best.id)}`);
    }
    for (const field of MIRRORED_FIELDS) {
      if (JSON.stringify(record[field]) !== JSON.stringify(best[field])) {
        errors.push(`top-level ${field} must mirror the best approach`);
      }
    }
    return errors;
  }

  const api = {
    MAX_APPROACHES,
    LABEL_MAX,
    INSIGHT_MAX,
    compareApproaches,
    getBestApproach,
    normalizeLabel,
    normalizeInsight,
    mirrorBestApproach,
    validateSolutionRecord
  };
  const root = typeof window !== 'undefined' ? window : globalThis;
  root.__cssbattleApproachContract = api;
})();
