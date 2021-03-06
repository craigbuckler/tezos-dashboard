// system updates
// typically database schema changes
import pkg from './package.json' assert {type: 'json'};
import process from 'node:process';
import { readdir } from 'node:fs/promises';
import 'dotenv/config';
import { versionToInt, pad } from './lib/lib.js';
import * as db from './lib/db.js';

const
  updateDir = './update/',

  runUpdate = process.argv[2],
  runUpdateInt = versionToInt( runUpdate ),

  setting = db.conn.collection('setting'),
  setVersion = { name: 'version' },
  appVersion = pkg.version,
  appVersionInt = versionToInt( appVersion ),
  dbVersion = (await setting.findOne(setVersion))?.value || '0.0.0',
  dbVersionInt = versionToInt(dbVersion);

// get update files
const updateFile = (await readdir(updateDir))
  .filter(f => {
    const v = versionToInt(f);
    return (runUpdateInt === v) || (v > dbVersionInt && v <= appVersionInt);
  })
  .sort((a, b) => versionToInt(a) - versionToInt(b));

// start updates
console.log(`\ndatabase version   : ${ dbVersion }`);
console.log(`application version: ${ appVersion }`);
if (runUpdateInt) console.log(`update override    : ${ runUpdate }`);
console.log(`updates to apply   : ${ updateFile.length }\n`);

// process updates
let abort = false;
while (updateFile.length && !abort) {

  // import next file
  const
    fn = updateFile.shift().trim(),
    fnVer = fn.slice(0, -3),
    ufile = updateDir + fn,
    ufunc = (await import(ufile)).default || [];

  console.log(`${ pad(fnVer, 19) }:`);

  // run next function
  let fnc = 0;
  while (ufunc.length && !abort) {
    fnc++;
    const update = await ufunc.shift()(db.conn);
    abort = !update.result;
    console.log(`${ pad(fnc, 19) }: ${ update.detail }${ abort ? ' - FAILED' : '' }`);
  }

  // update DB settings
  if (!abort) {
    let res = await setting.updateOne(setVersion, { $set: { value: fnVer }}, { upsert: true });
    abort = !res.modifiedCount && !res.upsertedCount;
  }

}

// close database
await db.close();
