/**
 * CSSBattle Auto Archive — Main World Content Script
 * 
 * Runs in the context of the page (MAIN world).
 * Monkey-patches window.fetch to intercept CSSBattle score submissions.
 * Posts intercepted submissions to the isolated world content script.
 * Also hosts the built-in CSSBattle plugin toolbar.
 */
(function () {
  'use strict';

  // Prevent double injection
  if (window.__cssba_main_injected) return;
  window.__cssba_main_injected = true;

  console.log('[CSSBattle Archive] Main world fetch interceptor loaded');

  // ─── Fetch Interceptor ───────────────────────────────────────────────

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

  // ─── Plugin Toolbar ──────────────────────────────────────────────────

  const PLUGIN_UI_SOURCE = 'cssbattle-archive-ui';
  let pluginSettings = null;

  function isPlayPage() {
    return location.pathname.startsWith('/play');
  }

  function initPluginToolbar() {
    if (!isPlayPage()) return;
    if (!window.__cssbattlePluginManager) {
      console.warn('[CSSBattle Archive] Plugin manager not loaded');
      return;
    }

    window.__cssbattlePluginManager.registerAll();

    if (pluginSettings && pluginSettings.toolbarVisible) {
      const enabledIds = getEnabledPluginIds();
      if (enabledIds.length > 0) {
        window.__cssbattlePluginManager.injectToolbar(enabledIds);
      }
    }
  }

  function getEnabledPluginIds() {
    const all = window.__cssbattlePluginManager.getPluginList().map(p => p.id);
    if (!pluginSettings || !pluginSettings.enabledPlugins) return all;
    return all.filter(id => pluginSettings.enabledPlugins[id] !== false);
  }

  function requestPluginSettings() {
    window.postMessage({
      source: PLUGIN_UI_SOURCE,
      type: 'REQUEST_PLUGIN_SETTINGS'
    }, '*');
  }

  function setToolbarVisible(visible) {
    if (!window.__cssbattlePluginManager) return;
    pluginSettings = pluginSettings || { enabledPlugins: {} };
    pluginSettings.toolbarVisible = visible;

    if (visible) {
      const enabledIds = getEnabledPluginIds();
      if (enabledIds.length > 0) {
        window.__cssbattlePluginManager.injectToolbar(enabledIds);
      }
    } else {
      window.__cssbattlePluginManager.removeToolbar();
    }
  }

  function setEnabledPlugins(enabledPlugins) {
    if (!window.__cssbattlePluginManager) return;
    pluginSettings = pluginSettings || { toolbarVisible: false };
    pluginSettings.enabledPlugins = enabledPlugins;

    if (pluginSettings.toolbarVisible) {
      const enabledIds = getEnabledPluginIds();
      if (enabledIds.length > 0) {
        window.__cssbattlePluginManager.injectToolbar(enabledIds);
      } else {
        window.__cssbattlePluginManager.removeToolbar();
      }
    }
  }

  // Wait for DOM and CSSBattle editor, then initialize.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      requestPluginSettings();
      // Give CSSBattle a moment to mount the editor.
      setTimeout(initPluginToolbar, 1200);
    });
  } else {
    requestPluginSettings();
    setTimeout(initPluginToolbar, 1200);
  }

  // Re-evaluate toolbar visibility on SPA navigation.
  window.addEventListener('popstate', () => {
    if (!isPlayPage() && window.__cssbattlePluginManager) {
      window.__cssbattlePluginManager.removeToolbar();
    } else if (isPlayPage() && pluginSettings?.toolbarVisible) {
      setTimeout(initPluginToolbar, 600);
    }
  });

  // ─── UI Message Handling ─────────────────────────────────────────────

  window.addEventListener('message', (event) => {
    if (event.data?.source !== PLUGIN_UI_SOURCE) return;

    const { type, payload } = event.data;

    if (type === 'PLUGIN_SETTINGS') {
      pluginSettings = payload || { toolbarVisible: true, enabledPlugins: {} };
      initPluginToolbar();
      return;
    }

    if (type === 'TOGGLE_TOOLBAR') {
      setToolbarVisible(!!payload?.visible);
      return;
    }

    if (type === 'SET_ENABLED_PLUGINS') {
      setEnabledPlugins(payload?.enabledPlugins || {});
      return;
    }

    if (!window.__cssbattlePluginManager) {
      window.postMessage({
        source: PLUGIN_UI_SOURCE,
        type: 'PLUGIN_RESULT',
        payload: { success: false, error: 'Plugin manager not available' }
      }, '*');
      return;
    }

    if (type === 'RUN_PLUGIN') {
      const result = window.__cssbattlePluginManager.runPlugin(payload?.id);
      window.postMessage({
        source: PLUGIN_UI_SOURCE,
        type: 'PLUGIN_RESULT',
        payload: result
      }, '*');
      return;
    }

    if (type === 'UNDO_PLUGIN') {
      const result = window.__cssbattlePluginManager.undo();
      window.postMessage({
        source: PLUGIN_UI_SOURCE,
        type: 'PLUGIN_RESULT',
        payload: result
      }, '*');
      return;
    }
  });
})();
