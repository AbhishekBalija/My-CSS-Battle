/**
 * CSSBattle Auto Archive — Main World Content Script
 * 
 * Runs in the context of the page (MAIN world).
 * Monkey-patches window.fetch to intercept CSSBattle score submissions.
 * Posts intercepted submissions to the isolated world content script.
 */
(function () {
  'use strict';

  // Prevent double injection
  if (window.__cssba_main_injected) return;
  window.__cssba_main_injected = true;

  console.log('[CSSBattle Archive] Main world fetch interceptor loaded');

  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const [input, init] = args;
    const url = typeof input === 'string' ? input : input?.url || '';
    const method = (init?.method || 'GET').toUpperCase();

    const response = await originalFetch.apply(this, args);

    if (method === 'POST' && url.includes('/api/getScore')) {
      try {
        const clone = response.clone();
        const responseData = await clone.json();
        const urlObj = new URL(url, window.location.origin);
        const levelId = urlObj.searchParams.get('levelId');

        let requestBody = {};
        if (init?.body) {
          try {
            requestBody = JSON.parse(init.body);
          } catch (e) {
            requestBody = { code: init.body };
          }
        }

        console.log('[CSSBattle Archive] API submission intercepted:', {
          levelId,
          score: responseData.score,
          match: responseData.match
        });

        // Send to isolated world content script
        window.postMessage({
          source: 'cssbattle-archive-interceptor',
          type: 'SUBMISSION_INTERCEPTED',
          levelId,
          requestBody,
          responseData
        }, '*');

      } catch (err) {
        console.error('[CSSBattle Archive] Interception parsing error:', err);
      }
    }

    return response;
  };
})();
