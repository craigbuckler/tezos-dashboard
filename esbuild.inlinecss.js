/*
esbuild plugin
inline CSS import into a string

// _____________________________________________________
// use in esbuild.config.js
import esbuild from 'esbuild';
import { inlineCSS } from './esbuild.inlinecss.js';

esbuild.build({
  plugins: [
    inlineCSS
  ]
}).catch(() => process.exit(1));

// _____________________________________________________
// in JavaScript source file:
import styles from './css/styles.css';

function getStyles() {
  return styles;
}

// _____________________________________________________
// builds to:
var styles_default = 'body { font-family: sans-serif; }';

function getStyles() {
  return styles_default;
}
*/

import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';

export const inlineCSS = {

  name: 'inlineCSS',
  setup(build) {

    build.onResolve({ filter: /css$/ }, args => {

      const path = resolve(args.resolveDir, args.path);

      return {
        path,
        watchFiles: [ path ],
        namespace: 'inlineCSS'
      };

    });

    build.onLoad({ filter: /.*/, namespace: 'inlineCSS' }, async args => {

      // read CSS file
      const css = await readFile(args.path, 'utf-8');

      return {
        contents: JSON.stringify(css),
        loader: 'json'
      };

    });

  }

};
