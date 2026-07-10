/**
 * Nested Template plugin
 * Original: https://github.com/artlung/artlung-cssbattle-plugins/blob/main/plugins/NestedTemplate.js
 * Copyright Joe Crawford (artlung), Apache-2.0 license.
 *
 * Inserts a nested-CSS starter template into the CSSBattle editor.
 */
(function () {
  'use strict';

  if (!window.__cssbattlePlugins) window.__cssbattlePlugins = {};

  window.__cssbattlePlugins['nested-template'] = {
    id: 'nested-template',
    name: 'Nested Template',
    description: 'Insert a nested CSS (& { * { … } }) starter template.',
    category: 'template',
    run: function run(code) {
      return `<style>
& {
  margin: 20 60;
  background: yellow;
  * {
    background: #000;
  }
}`;
    }
  };
})();
