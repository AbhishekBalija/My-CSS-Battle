/**
 * CSSBattle Plugin Manager
 *
 * Loads built-in plugins, provides editor read/write helpers for CodeMirror 6,
 * and injects a plugin toolbar into the CSSBattle output panel.
 *
 * Plugins are registered into window.__cssbattlePlugins by the individual
 * plugin files in extension/plugins/.
 */
(function () {
  'use strict';

  // Prevent double-injection.
  if (window.__cssbattlePluginManager) return;

  const TOOLBAR_ID = 'cssbattle-archive-plugin-toolbar';
  const TOAST_ID = 'cssbattle-archive-plugin-toast';

  // ─── Plugin Registry ─────────────────────────────────────────────────

  const plugins = new Map();

  function registerAll() {
    const registry = window.__cssbattlePlugins || {};
    for (const [id, plugin] of Object.entries(registry)) {
      plugins.set(id, plugin);
    }
  }

  function getPluginList() {
    return Array.from(plugins.values()).map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category
    }));
  }

  // ─── Editor Helpers ──────────────────────────────────────────────────

  function getEditorView() {
    const cmContent = document.querySelector('.cm-content');
    if (!cmContent) return null;

    const cmEditor = cmContent.closest('.cm-editor');
    return (
      cmEditor?.cmView?.view ||
      cmContent.cmView?.view ||
      window.cssbattleEditor ||
      window.__cssbattleEditor ||
      window.editor ||
      window.__editor ||
      null
    );
  }

  function getCode() {
    const view = getEditorView();
    if (view && view.state && view.state.doc) {
      return view.state.doc.toString();
    }
    const cmContent = document.querySelector('.cm-content');
    return cmContent ? (cmContent.innerText || cmContent.textContent || '') : null;
  }

  function setCode(code) {
    const view = getEditorView();
    if (view && view.dispatch && view.state && view.state.doc) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: code }
      });
      return true;
    }

    const cmContent = document.querySelector('.cm-content');
    if (!cmContent) return false;

    // Fallback: simulate user typing so CodeMirror recognizes the change.
    cmContent.focus();
    if (document.execCommand) {
      document.execCommand('selectAll', false, null);
      const inserted = document.execCommand('insertText', false, code);
      if (inserted) return true;
    }

    // Last-resort fallback: directly mutate innerText and dispatch events.
    cmContent.innerText = code;
    cmContent.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
    cmContent.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  // ─── Run / Undo ──────────────────────────────────────────────────────

  let lastCode = null;

  function runPlugin(id) {
    const plugin = plugins.get(id);
    if (!plugin) return { success: false, error: `Plugin "${id}" not found` };

    const code = getCode();
    if (code === null) return { success: false, error: 'CSSBattle editor not found' };

    lastCode = code;
    try {
      const result = plugin.run(code);
      if (typeof result !== 'string') {
        return { success: false, error: 'Plugin did not return a string' };
      }
      if (!setCode(result)) {
        return { success: false, error: 'Could not write to editor' };
      }
      return { success: true, plugin: id, charsBefore: code.length, charsAfter: result.length };
    } catch (err) {
      return { success: false, error: err.message || 'Plugin failed' };
    }
  }

  function undo() {
    if (lastCode === null) return { success: false, error: 'Nothing to undo' };
    const restored = lastCode;
    if (!setCode(lastCode)) {
      return { success: false, error: 'Could not restore editor content' };
    }
    lastCode = null;
    return { success: true, charsAfter: restored.length };
  }

  // ─── UI Injection ────────────────────────────────────────────────────

  function removeToolbar() {
    const existing = document.getElementById(TOOLBAR_ID);
    if (existing) existing.remove();
    const existingToast = document.getElementById(TOAST_ID);
    if (existingToast) existingToast.remove();
  }

  function showToast(message, type = 'info') {
    let toast = document.getElementById(TOAST_ID);
    if (!toast) {
      toast = document.createElement('div');
      toast.id = TOAST_ID;
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 16px;
      right: 16px;
      z-index: 2147483647;
      padding: 10px 14px;
      border-radius: 6px;
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: #fff;
      background: ${type === 'error' ? '#ff5252' : '#00c853'};
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.2s, transform 0.2s;
      pointer-events: none;
    `;

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
    }, 2200);
  }

  function findOutputContainer() {
    return document.querySelector('.container__item--output .item__content');
  }

  function injectToolbar(enabledIds = []) {
    removeToolbar();
    registerAll();

    const available = getPluginList();
    const active = available.filter(p => enabledIds.includes(p.id));
    if (active.length === 0) return;

    const outputContainer = findOutputContainer();
    const embedded = !!outputContainer;

    const toolbar = document.createElement('div');
    toolbar.id = TOOLBAR_ID;

    if (embedded) {
      toolbar.style.cssText = `
        width: 100%;
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        border-radius: 10px;
        background: rgba(30, 30, 46, 0.96);
        border: 1px solid rgba(255,255,255,0.08);
        box-shadow: 0 8px 24px rgba(0,0,0,0.35);
        backdrop-filter: blur(8px);
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        box-sizing: border-box;
      `;
    } else {
      // Fallback: fixed bottom-right of the viewport if the output panel isn't found.
      toolbar.style.cssText = `
        position: fixed;
        bottom: 16px;
        right: 16px;
        z-index: 2147483646;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 10px;
        border-radius: 10px;
        background: rgba(30, 30, 46, 0.96);
        border: 1px solid rgba(255,255,255,0.08);
        box-shadow: 0 8px 24px rgba(0,0,0,0.35);
        backdrop-filter: blur(8px);
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        min-width: 160px;
        max-width: 220px;
      `;
    }

    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #ffcc00;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    `;
    header.innerHTML = `<span>CSSBattle Plugins</span>`;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.title = 'Hide toolbar';
    closeBtn.style.cssText = `
      background: transparent;
      border: none;
      color: #8899aa;
      font-size: 16px;
      line-height: 1;
      cursor: pointer;
      padding: 0 2px;
    `;
    closeBtn.addEventListener('click', () => {
      removeToolbar();
      notifyVisibilityChange(false);
    });
    header.appendChild(closeBtn);
    toolbar.appendChild(header);

    active.forEach(plugin => {
      const btn = document.createElement('button');
      btn.textContent = plugin.name;
      btn.title = plugin.description || '';
      btn.style.cssText = `
        display: block;
        width: 100%;
        padding: 8px 10px;
        border: none;
        border-radius: 6px;
        background: ${plugin.category === 'template' ? '#3b3b5c' : '#21262d'};
        color: #e0e0e0;
        font-size: 12px;
        font-weight: 600;
        text-align: left;
        cursor: pointer;
        transition: background 0.15s, transform 0.05s;
      `;
      btn.addEventListener('mouseenter', () => { btn.style.background = plugin.category === 'template' ? '#4e4e78' : '#30363d'; });
      btn.addEventListener('mouseleave', () => { btn.style.background = plugin.category === 'template' ? '#3b3b5c' : '#21262d'; });
      btn.addEventListener('mousedown', () => { btn.style.transform = 'scale(0.98)'; });
      btn.addEventListener('mouseup', () => { btn.style.transform = 'scale(1)'; });
      btn.addEventListener('click', () => {
        const result = runPlugin(plugin.id);
        if (result.success) {
          showToast(`${plugin.name} applied (${result.charsBefore} → ${result.charsAfter} chars)`);
        } else {
          showToast(result.error, 'error');
        }
      });
      toolbar.appendChild(btn);
    });

    const undoBtn = document.createElement('button');
    undoBtn.textContent = '↶ Undo';
    undoBtn.style.cssText = `
      display: block;
      width: 100%;
      padding: 8px 10px;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 6px;
      background: transparent;
      color: #8899aa;
      font-size: 12px;
      font-weight: 600;
      text-align: center;
      cursor: pointer;
      margin-top: 4px;
      transition: background 0.15s;
    `;
    undoBtn.addEventListener('mouseenter', () => { undoBtn.style.background = 'rgba(255,255,255,0.05)'; });
    undoBtn.addEventListener('mouseleave', () => { undoBtn.style.background = 'transparent'; });
    undoBtn.addEventListener('click', () => {
      const result = undo();
      showToast(result.success ? 'Undo successful' : result.error, result.success ? 'info' : 'error');
    });
    toolbar.appendChild(undoBtn);

    if (embedded) {
      outputContainer.appendChild(toolbar);
    } else {
      document.body.appendChild(toolbar);
    }
  }

  function notifyVisibilityChange(visible) {
    window.postMessage({
      source: 'cssbattle-archive-ui',
      type: 'TOOLBAR_VISIBILITY_CHANGED',
      payload: { visible }
    }, '*');
  }

  // ─── Public API ──────────────────────────────────────────────────────

  window.__cssbattlePluginManager = {
    registerAll,
    getPluginList,
    runPlugin,
    undo,
    injectToolbar,
    removeToolbar,
    getCode,
    setCode
  };
})();
