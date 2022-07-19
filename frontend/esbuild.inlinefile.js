/*
esbuild plugin
inline HTML, CSS, or SVG code as a JavaScript string

// _____________________________________________________
// use in esbuild.config.js
import esbuild from 'esbuild';
import { inlineFile } from './esbuild.inlinefile.js';

esbuild.build({
  ...
  plugins: [
    inlineFile
  ],
  ...
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

export const inlineFile = {

  name: 'inlineFile',
  setup(build) {

    build.onResolve({ filter: /\.(html|css|svg)$/ }, args => {

      const path = resolve(args.resolveDir, args.path);

      return {
        path,
        watchFiles: [ path ],
        namespace: 'inlineFile'
      };

    });

    build.onLoad({ filter: /.*/, namespace: 'inlineFile' }, async args => {

      // read file
      const file = await readFile(args.path, 'utf-8');

      return {
        contents: JSON.stringify(file.trim()),
        loader: 'json'
      };

    });

  }

};
