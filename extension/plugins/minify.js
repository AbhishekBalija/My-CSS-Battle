/**
 * Minify plugin
 * Original: https://github.com/artlung/artlung-cssbattle-plugins/blob/main/plugins/Minify.js
 * Copyright Joe Crawford (artlung), Apache-2.0 license.
 *
 * Removes whitespace, comments, and shortens common CSSBattle tokens.
 */
(function () {
  'use strict';

  if (!window.__cssbattlePlugins) window.__cssbattlePlugins = {};

  window.__cssbattlePlugins['minify'] = {
    id: 'minify',
    name: 'Minify',
    description: 'Strip whitespace, comments, and normalize CSS tokens.',
    category: 'transform',
    run: function run(code) {
      let processedCode = code
        .replace(/\<\!--\s*?[^\s?\[][\s\S]*?--\>/g, '')
        .replace(/\>\s*\</g, '><')
        .replace(/\/\*.*\*\/|\/\*[\s\S]*?\*\/|\n|\t|\v|\s{2,}/g, '')
        .replace(/\s*\{\s*/g, '{')
        .replace(/\s*\}\s*/g, '}')
        .replace(/\s*\:\s*/g, ':')
        .replace(/\s*\;\s*/g, ';')
        .replace(/\s*\,\s*/g, ',')
        .replace(/\s*\~\s*/g, '~')
        .replace(/\s*\>\s*/g, '>')
        .replace(/\s*\+\s*/g, '+')
        .replace(/\s*\!\s*/g, '!')
        .replaceAll('transparent', '#0000')
        .replaceAll(') ', ')')
        .replaceAll('/ ', '/')
        .replaceAll(' /', '/')
        .replaceAll(';}','}')
        .replace('</style>', '')
        .replaceAll('% ', '%');

      return processedCode;
    }
  };
})();
