/**
 * Unit Replacement plugin
 * Original: https://github.com/artlung/artlung-cssbattle-plugins/blob/main/plugins/UnitReplacementList.js
 * Copyright Joe Crawford (artlung), Apache-2.0 license.
 *
 * Replaces pixel values with the shortest equivalent unit (vw/vh/pc/0).
 */
(function () {
  'use strict';

  if (!window.__cssbattlePlugins) window.__cssbattlePlugins = {};

  window.__cssbattlePlugins['unit-replacement'] = {
    id: 'unit-replacement',
    name: 'Unit Replacement',
    description: 'Replace px with the shortest equivalent vw/vh/pc/0.',
    category: 'transform',
    run: function run(code) {
      let replacement_list = {}, i, px, vw, vh, pc, unit, neg_px, neg_unit;
      for (i = 0; i <= 2000; i++) {
        px = i + 'px';
        vw = i / 4 + 'vw';
        vh = i / 3 + 'vh';
        pc = i / 16 + 'pc';
        unit = i === 0 ? '0' : i + 'px';
        unit = px.length < unit.length ? px : unit;
        unit = vw.length < unit.length ? vw : unit;
        unit = vh.length < unit.length ? vh : unit;
        unit = pc.length < unit.length ? pc : unit;
        replacement_list[px] = unit;

        // negative values
        neg_px = -i + 'px';
        neg_unit = '-' + unit;
        replacement_list[neg_px] = neg_unit;
      }

      // split by newlines, then by spaces
      let lines = code.split('\n');
      for (let i = 0; i < lines.length; i++) {
        let words = lines[i].split(' ');
        for (let j = 0; j < words.length; j++) {
          let match = words[j].match(/-?\d+px/g);
          if (match) {
            for (let k = 0; k < match.length; k++) {
              let px = match[k];
              let unit = replacement_list[px];
              words[j] = words[j].replace(px, unit);
            }
          }
        }
        lines[i] = words.join(' ');
      }
      code = lines.join('\n');
      return code;
    }
  };
})();
