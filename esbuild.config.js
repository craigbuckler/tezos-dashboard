import { argv } from 'node:process';
import esbuild from 'esbuild';
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

esbuild.build({

  entryPoints: [ './src/js/main.js' ],
  platform: 'neutral',
  format: 'esm',
  bundle: true,
  minify: productionMode,
  sourcemap: !productionMode && 'linked',
  mainFields: ['module', 'browser', 'main'],
  banner: { js: `/* ${ tokens.meta.app } ${ tokens.meta.version }, by ${ tokens.meta.author }, built: ${ (new Date()).toISOString() } */` },
  plugins: [
    textReplace({
      include: /.js$/,
      pattern
    }),
    time('JavaScript')
  ],
  watch: !productionMode,
  outfile: './build/js/main.js'

}).catch(() => process.exit(1));