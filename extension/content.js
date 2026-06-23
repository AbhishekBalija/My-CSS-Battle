/**
 * CSSBattle Auto Archive — Content Script
 * 
 * Runs on cssbattle.dev/play/* pages.
 * Intercepts submission API calls and collects challenge data.
 * Sends collected data to the background service worker for GitHub publishing.
 */

(function () {
  'use strict';

  // Prevent double injection
  if (window.__cssba_injected) return;
  window.__cssba_injected = true;

  console.log('[CSSBattle Archive] Isolated content script loaded');

  // ─── Message Listener ────────────────────────────────────────────────
  // Listen for messages from the MAIN world interceptor

  window.addEventListener('message', (event) => {
    // Only accept messages from our interceptor
    if (event.data?.source !== 'cssbattle-archive-interceptor') return;

    if (event.data?.type === 'SUBMISSION_INTERCEPTED') {
      const { levelId, requestBody, responseData } = event.data;

      console.log('[CSSBattle Archive] Submission received from main world:', {
        levelId,
        score: responseData.score,
        match: responseData.match
      });

      // Collect DOM details + package submission data
      const submissionData = collectSubmissionData(levelId, requestBody, responseData);

      // Send to background service worker
      chrome.runtime.sendMessage({
        type: 'SUBMISSION_CAPTURED',
        data: submissionData
      });
    }
  });

  // ─── Data Collection ─────────────────────────────────────────────────

  function collectSubmissionData(levelId, requestBody, responseData) {
    // In a Next.js SPA, __NEXT_DATA__ is stale after client-side navigation.
    // Therefore, we must rely ENTIRELY on DOM scraping.
    
    const targetInfo = getTargetFromDOM(levelId);

    // Get character count from code
    const code = requestBody.code || '';
    const charCount = code.length;

    // Get score display from DOM for high score comparison
    const scoreInfo = getScoreFromDOM();

    return {
      // Challenge identification
      levelId: levelId,
      challengeType: isNaN(Number(levelId)) ? 'daily' : 'battle',

      // Target metadata
      targetName: targetInfo.name,
      targetImage: targetInfo.image,
      targetColors: targetInfo.colors,

      // Solution data
      code: code,
      charCount: charCount,
      score: responseData.score,
      match: responseData.match,
      validationTags: responseData.validationTags || [],

      // Score context
      highScore: scoreInfo.highScore,
      highScoreChars: scoreInfo.highScoreChars,

      // Metadata
      submittedAt: new Date().toISOString(),
      timeZone: requestBody.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      pageUrl: window.location.href,
      pageTitle: document.title,
    };
  }

  function getTargetFromDOM(levelId) {
    const title = document.title || '';
    let name = `Target ${levelId}`;

    // Extract name from title
    // Daily format: "CSS Battle — Daily Targets > Jun 20, 2026"
    // Custom Challenge format: "CSS Battle — Custom Challenge: 20/6/2026"
    // Battle format: "CSS Battle — Target #1: Simply Square"
    if (title.includes('Daily Targets')) {
      const match = title.match(/Daily Targets?\s*>\s*(.+)/i);
      if (match) name = `Daily Target — ${match[1].trim()}`;
    } else if (title.includes('Custom Challenge')) {
      const match = title.match(/Custom Challenge:\s*(.+)/i);
      if (match) {
        const rawDate = match[1].trim();
        const dateParts = rawDate.split('/');
        if (dateParts.length === 3) {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const day = dateParts[0];
          const monthIdx = parseInt(dateParts[1]) - 1;
          const year = dateParts[2];
          if (monthIdx >= 0 && monthIdx < 12) {
            name = `Daily Target — ${months[monthIdx]} ${day}, ${year}`;
          } else {
            name = `Daily Target — ${rawDate}`;
          }
        } else {
          name = `Daily Target — ${rawDate}`;
        }
      }
    } else if (title.includes('Target #')) {
      const match = title.match(/Target\s*#\d+:\s*(.+)/i);
      if (match) name = match[1].trim();
    }

    // Get colors from DOM buttons
    const colorButtons = document.querySelectorAll('.js-target-color');
    const colors = Array.from(colorButtons).map(btn =>
      btn.textContent.trim()
    ).filter(c => c.startsWith('#'));

    // Get target image
    let image = '';
    const targetImg = document.querySelector('.levelpage__target');
    if (targetImg && targetImg.src) {
      image = targetImg.src;
    } else if (!isNaN(Number(levelId))) {
      // Fallback for known battle target URLs
      image = `https://cssbattle.dev/targets/${levelId}.png`;
    }

    return { name, image, colors };
  }

  function getScoreFromDOM() {
    const scoreContainer = document.querySelector('.score-container');
    if (!scoreContainer) return { highScore: null, highScoreChars: null };

    const text = scoreContainer.innerText || '';

    // Parse "741.54 {109}" format from "High score" section
    const highScoreMatch = text.match(/High score[\s\S]*?([\d.]+)\s*\{(\d+)\}/i);
    return {
      highScore: highScoreMatch ? parseFloat(highScoreMatch[1]) : null,
      highScoreChars: highScoreMatch ? parseInt(highScoreMatch[2]) : null,
    };
  }

  // ─── Screenshot Request Handler ──────────────────────────────────────

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'REQUEST_PAGE_DATA') {
      // Background script can request current page data
      const nextData = window.__NEXT_DATA__;
      const pageProps = nextData?.props?.pageProps || {};

      sendResponse({
        url: window.location.href,
        title: document.title,
        levelId: pageProps.levelIdParam,
        level: pageProps.level,
        editorContent: document.querySelector('.cm-content')?.innerText || '',
      });
    }
    return true; // Keep message channel open for async
  });

})();
