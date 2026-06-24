/**
 * CSSBattle Auto Archive — Background Service Worker
 * Receives submission data from content script.
 * Handles GitHub API integration and deduplication.
 */

const CONFIG = {
  GITHUB_OWNER: 'AbhishekBalija',
  GITHUB_REPO: 'My-CSS-Battle',
  GITHUB_BRANCH: 'main',
  CSSBATTLE_USER_ID: 'pQ9KG3zTaHVaEr09zgJdyvWF5a62',
  CSSBATTLE_USERNAME: 'abhishek_balija',
  RANK_API: 'https://us-central1-cssbattleapp.cloudfunctions.net/getRank',
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SUBMISSION_CAPTURED') {
    handleSubmission(message.data, sender.tab).then(result => {
      console.log('[Archive] Result:', result);
      chrome.runtime.sendMessage({ type: 'PUBLISH_RESULT', data: result }).catch(() => {});
    }).catch(err => {
      console.error('[Archive] Error:', err);
      chrome.runtime.sendMessage({ type: 'PUBLISH_ERROR', error: err.message }).catch(() => {});
    });
  }
  if (message.type === 'GET_STATUS') {
    getStatus().then(sendResponse);
    return true;
  }
  if (message.type === 'TEST_CONNECTION') {
    testGitHubConnection().then(sendResponse);
    return true;
  }
});

async function handleSubmission(data, tab) {
  const token = await getGitHubToken();
  if (!token) throw new Error('GitHub token not configured. Open extension popup to set it.');
  if (!data.score || data.score <= 0) return { action: 'ignored', reason: 'Zero score' };

  let screenshotBase64 = null;
  try {
    if (tab?.id) {
      const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png', quality: 90 });
      screenshotBase64 = dataUrl.replace(/^data:image\/png;base64,/, '');
    }
  } catch (err) { console.warn('[Archive] Screenshot failed:', err); }

  const filePath = getFilePath(data);
  const existing = await getFileFromGitHub(token, filePath);
  const decision = dedup(data, existing, filePath);
  if (decision.action === 'ignore') return decision;

  const fileContent = buildFileContent(data, decision, existing, filePath);
  const label = decision.action === 'create' ? '✨ Add' : '⬆️ Update';
  await pushToGitHub(token, filePath, fileContent, existing?.sha,
    `${label} ${data.levelId}: ${data.targetName}`);

  if (screenshotBase64) {
    const ssExisting = await getFileFromGitHub(token, `public/screenshots/${data.levelId}.png`);
    await pushToGitHub(token, `public/screenshots/${data.levelId}.png`, screenshotBase64, ssExisting?.sha,
      `📸 Screenshot: ${data.targetName}`, true);
  }

  try { await updateProfile(token); } catch (e) { console.warn('[Archive] Profile update failed:', e); }

  await chrome.storage.local.set({
    lastSubmission: {
      levelId: data.levelId, targetName: data.targetName, score: data.score,
      charCount: data.charCount, action: decision.action, timestamp: Date.now(),
    }
  });
  return { action: decision.action, levelId: data.levelId, targetName: data.targetName, score: data.score, charCount: data.charCount };
}

function parseExistingFile(fileData) {
  if (!fileData || !fileData.content) return null;
  try {
    const decoded = atob(fileData.content.replace(/\n/g, ''));
    return JSON.parse(decoded);
  } catch { return null; }
}

function compareSolution(newData, existing, label) {
  const found = existing.find(s => s.id === newData.levelId);
  if (!found) return { action: 'add', reason: `New ${label} solution`, index: -1 };
  if (newData.score > found.score) return { action: 'update', reason: `Better score: ${newData.score} > ${found.score}`, index: existing.indexOf(found) };
  if (newData.score === found.score && newData.charCount < found.characters) return { action: 'update', reason: `Fewer chars: ${newData.charCount} < ${found.characters}`, index: existing.indexOf(found) };
  return { action: 'ignore', reason: `No improvement: ${newData.score}/${newData.charCount} vs ${found.score}/${found.characters}` };
}

function dedup(newData, existingFile, filePath) {
  const existing = parseExistingFile(existingFile);
  if (!existing) return { action: 'create', reason: 'New file' };

  // Battles: single file with array of solutions — find by id
  if (filePath === 'data/battles.json') {
    if (!Array.isArray(existing)) return { action: 'create', reason: 'Malformed battles file' };
    return compareSolution(newData, existing, 'battle');
  }

  // Daily: month file with array of solutions — find by id
  if (Array.isArray(existing)) {
    return compareSolution(newData, existing, 'daily');
  }

  return { action: 'create', reason: 'Unrecognized format' };
}

function buildSolutionObject(d) {
  return {
    id: d.levelId,
    name: d.targetName,
    type: d.challengeType,
    ...(d.challengeType === 'battle' ? { battleNumber: Number(d.levelId) } : {}),
    score: d.score,
    match: d.match,
    characters: d.charCount,
    colors: d.targetColors,
    date: d.submittedAt.split('T')[0],
    timestamp: d.submittedAt,
    tags: d.validationTags,
    url: d.pageUrl,
    targetImage: d.targetImage || null,
    code: d.code,
  };
}

function buildFileContent(data, decision, existingFile, filePath) {
  const newSolution = buildSolutionObject(data);

  if (decision.action === 'create') {
    // New file — start with array
    return JSON.stringify([newSolution], null, 2);
  }

  const existing = parseExistingFile(existingFile);
  if (!Array.isArray(existing)) {
    return JSON.stringify([newSolution], null, 2);
  }

  if (decision.action === 'add') {
    // Append new solution to array
    existing.push(newSolution);
  } else if (decision.action === 'update' && decision.index >= 0) {
    // Replace existing solution
    existing[decision.index] = newSolution;
  }

  // Sort daily by date, battles by battleNumber
  if (filePath.startsWith('data/daily/')) {
    existing.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else {
    existing.sort((a, b) => (a.battleNumber || 0) - (b.battleNumber || 0));
  }

  return JSON.stringify(existing, null, 2);
}

function getFilePath(data) {
  if (data.challengeType === 'daily') {
    // Month-wise: data/daily/{year}/{MM}-{monthname}.json
    const date = new Date(data.submittedAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const monthNames = ['january','february','march','april','may','june','july','august','september','october','november','december'];
    const monthName = monthNames[date.getMonth()];
    return `data/daily/${year}/${month}-${monthName}.json`;
  } else {
    // All battles in one file: data/battles.json
    return `data/battles.json`;
  }
}

async function getGitHubToken() {
  const { githubToken } = await chrome.storage.sync.get('githubToken');
  return githubToken || null;
}

async function getFileFromGitHub(token, path) {
  try {
    const r = await fetch(`https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/contents/${path}?ref=${CONFIG.GITHUB_BRANCH}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } });
    return r.ok ? await r.json() : null;
  } catch { return null; }
}

async function pushToGitHub(token, path, content, sha, message, isBinary = false) {
  const body = { message, content: isBinary ? content : btoa(unescape(encodeURIComponent(content))), branch: CONFIG.GITHUB_BRANCH };
  if (sha) body.sha = sha;
  const r = await fetch(`https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/contents/${path}`,
    { method: 'PUT', headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(`GitHub ${r.status}: ${e.message || 'Unknown'}`); }
  return r.json();
}

async function fetchRankData() {
  try {
    const r = await fetch(`${CONFIG.RANK_API}?userId=${CONFIG.CSSBATTLE_USER_ID}`);
    return r.ok ? await r.json() : {};
  } catch {
    return {};
  }
}

function buildProfile(rankData) {
  return {
    userId: CONFIG.CSSBATTLE_USER_ID,
    username: CONFIG.CSSBATTLE_USERNAME,
    displayName: 'Abhishek A N',
    avatar: null,
    rating: 1200,
    rank: rankData.rank || null,
    totalScore: rankData.score || null,
    currentStreak: rankData.currentStreak || 0,
    longestStreak: rankData.longestStreak || 0,
    dailyTargetsPlayed: rankData.playedCount || 0,
    dailyAvgMatch: rankData.dailyAvgMatch || 0,
    dailyAvgChars: rankData.dailyAvgChars || 0,
    totalPlayers: rankData.totalPlayers || 0,
    country: 'India',
    whatYouDo: 'Web Developer',
    links: {
      website: 'https://abhishekbalija.xyz',
      github: 'AbhishekBalija',
      twitter: '@AbhishekBalija1',
      linkedin: '/in/abhishek-balija-551701221',
    },
  };
}

async function updateProfileHistory(token, profile) {
  const histFile = await getFileFromGitHub(token, 'content/profileHistory.json');
  let history = [];
  if (histFile) {
    try { history = JSON.parse(atob(histFile.content.replace(/\n/g, ''))); } catch {}
  }
  const last = history[history.length - 1];
  if (last && last.rank === profile.rank && last.totalScore === profile.totalScore) return;

  history.push({
    userId: CONFIG.CSSBATTLE_USER_ID,
    rank: profile.rank,
    rankChange: last ? (profile.rank - last.rank) : 0,
    playedCount: profile.dailyTargetsPlayed,
    totalPlayers: profile.totalPlayers,
    totalScore: profile.totalScore,
    lastUpdated: new Date().toISOString(),
    snapshotDate: new Date().toISOString(),
  });
  await pushToGitHub(token, 'content/profileHistory.json', JSON.stringify(history, null, 2), histFile?.sha, `📈 Profile snapshot`);
}

async function updateProfile(token) {
  const rankData = await fetchRankData();
  const profile = buildProfile(rankData);

  const existing = await getFileFromGitHub(token, 'content/profile.json');
  await pushToGitHub(token, 'content/profile.json', JSON.stringify(profile, null, 2), existing?.sha, `📊 Update profile (rank: ${profile.rank})`);

  await updateProfileHistory(token, profile);
}

async function getStatus() {
  const token = await getGitHubToken();
  const { lastSubmission } = await chrome.storage.local.get('lastSubmission');
  return { hasToken: !!token, lastSubmission: lastSubmission || null };
}

const CONNECTION_ERRORS = {
  401: (msg) => `Token is invalid or expired (${msg}). Generate a new classic PAT with the repo scope.`,
  404: (msg) => `Repo not found (${msg}). Either ${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO} does not exist or the token cannot access it.`,
  403: (msg) => `Permission denied (${msg}). Make sure your token has the 'repo' scope and the repo is accessible.`,
};

function formatStatusError(status, msg) {
  const fn = CONNECTION_ERRORS[status];
  return fn ? fn(msg) : msg;
}

async function parseGitHubError(r) {
  try {
    const err = await r.json();
    return err.message ? `${r.status}: ${err.message}` : `HTTP ${r.status}`;
  } catch {
    return `HTTP ${r.status}`;
  }
}

async function testGitHubConnection() {
  const token = await getGitHubToken();
  if (!token) return { success: false, error: 'No GitHub token saved. Paste your token below and click Save.' };

  try {
    const r = await fetch(`https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } });

    const scopes = r.headers.get('X-OAuth-Scopes') || '';
    const hasRepoScope = scopes.includes('repo') || scopes.includes('public_repo');

    if (r.ok) {
      const d = await r.json();
      if (!hasRepoScope) {
        return {
          success: false,
          error: `Token can read ${d.full_name}, but it is missing the 'repo' scope needed to push files. Generate a classic token with the repo scope enabled.`
        };
      }
      return { success: true, repo: d.full_name, scopes };
    }

    const msg = await parseGitHubError(r);
    return { success: false, error: formatStatusError(r.status, msg) };
  } catch (e) {
    return { success: false, error: `Network error: ${e.message}` };
  }
}
