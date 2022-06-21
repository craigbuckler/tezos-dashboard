// create tokens file for EJS
import { writeFile } from 'node:fs/promises';
import pkg from './package.json' assert {type: 'json'};
import tokens from './tokens.json' assert {type: 'json'};

// update tokens
tokens.meta.version = pkg.version;
tokens.meta.description = pkg.description;
tokens.meta.author = pkg.author;
tokens.meta.keywords = pkg.keywords.join(', ');

// write tokens file
try {
  await writeFile('./tokens-ejs.json', JSON.stringify(tokens, null, '\t'));
}
catch (err) {
  console.log(err);
}
