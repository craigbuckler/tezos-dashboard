import { argv } from 'node:process';

import esbuild from 'esbuild';
import { inlineFile } from './esbuild.inlinefile.js';
import textReplace from 'esbuild-plugin-text-replace';
import time from 'esbuild-plugin-time';

import pkg from './package.json' assert {type: 'json'};
import tokens from './tokens.json' assert {type: 'json'};
import { flatten } from './lib/json.cjs';

const productionMode = ('development' !== (argv[2] || process.env.NODE_ENV));

// update tokens
tokens.meta.version = pkg.version;
tokens.meta.description = pkg.description;
tokens.meta.author = pkg.author;
tokens.meta.api = process.env.API_URL;

// generate token replacements
const pattern = Object.entries( flatten( tokens, '__', '__' ) );

// remove console and debugger statements in production
if (productionMode) {
  pattern.push(
    [ /console\.[^\(]+\(.+\)\s*[;\n]/g, '' ],
    [ 'debugger', '' ]
  );
}

console.log(`JavaScript ${ productionMode ? 'production' : 'development' } build`);


// build service worker
esbuild.build({

  entryPoints: [ './src/js/sw.js' ],
  platform: 'neutral',
  format: 'esm',
  bundle: true,
  minify: productionMode,
  sourcemap: !productionMode && 'linked',
  mainFields: ['module', 'browser', 'main'],
  banner: { js: `/* ${ tokens.meta.app } service worker ${ tokens.meta.version }, by ${ tokens.meta.author }, built: ${ (new Date()).toISOString() } */` },
  plugins: [
    inlineFile,
    textReplace({
      include: /.js$/,
      pattern
    }),
    time('Service Worker')
  ],
  watch: !productionMode,
  outfile: './static/sw.js'

}).catch(() => process.exit(1));


// build dashboard and widgets
esbuild.build({

  entryPoints: [ './src/js/tezos-widgets.js', './src/js/dashboard.js' ],
  platform: 'neutral',
  format: 'esm',
  bundle: true,
  external: [ `./tezos-widgets.js?v${ tokens.meta.version }` ], // separate dashboard and widget API JavaScript
  minify: productionMode,
  sourcemap: !productionMode && 'linked',
  mainFields: ['module', 'browser', 'main'],
  banner: { js: `/* ${ tokens.meta.app } ${ tokens.meta.version }, by ${ tokens.meta.author }, built: ${ (new Date()).toISOString() } */` },
  plugins: [
    inlineFile,
    textReplace({
      include: /.js$/,
      pattern
    }),
    time('JavaScript')
  ],
  watch: !productionMode,
  outdir: './static/js/'

}).catch(() => process.exit(1));
