/**
 * Blank Template plugin
 * Original: https://github.com/artlung/artlung-cssbattle-plugins/blob/main/plugins/BlankTemplate.js
 * Copyright Joe Crawford (artlung), Apache-2.0 license.
 *
 * Inserts a minimal starter template into the CSSBattle editor.
 */
(function () {
  'use strict';

  if (!window.__cssbattlePlugins) window.__cssbattlePlugins = {};

  window.__cssbattlePlugins['blank-template'] = {
    id: 'blank-template',
    name: 'Blank Template',
    description: 'Insert a basic starter template.',
    category: 'template',
    run: function run(code) {
      return `<p>
<style>
  body {
    margin: 20 60;
    background: red    
  }
  p {
    height: 100;
    background: pink;
  }`;
    }
  };
})();
