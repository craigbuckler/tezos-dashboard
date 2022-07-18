/*
store JSON result of REST API in the database fetch collection

example:
  node ./tasks/fetch.js -name=myvalue -freq=600 -retain=30 https://url.com/api

where:

  -name   : associated database reference name
  -freq   : maximum frequency of fetches in seconds
  -retain : retain records for number of days (no value retains one record only)
  [url]   : URL to retrieve

*/
import process from 'node:process';
import 'dotenv/config';
import args from '../lib/args.js';
import { pad, nowOffset, fetchJSON } from '../lib/lib.js';
import * as db from '../lib/db.js';


// error list
const error = new Map([

  // success
  [ 'DONE',     { code:   0, msg: 'success' } ],
  [ 'FOUND',    { code:   0, msg: 'recent data already available' } ],

  // parameter errors
  [ 'NOURL',    { code: 101, msg: 'no URL specified' } ],
  [ 'NONAME',   { code: 102, msg: 'no database reference -name specified' } ],
  [ 'NOFREQ',   { code: 103, msg: 'no update frequency -freq specified' } ],

  // runtime errors
  [ 'DBDOWN',   { code: 201, msg: 'database access failure' } ],
  [ 'DBFIND',   { code: 202, msg: 'database find failure' } ],
  [ 'FETCH',    { code: 203, msg: 'fetch failure' } ],
  [ 'DBSAVE',   { code: 204, msg: 'database save failure' } ],
  [ 'DBDEL',    { code:   0, msg: 'database delete failure' } ]

]);

// validate arguments
let err = -1;

const
  url = args.param[0],
  name = args.option.name,
  freq = args.option.freq,
  retain = args.option.retain;

if (!url) err &= exitCode('NOURL');
if (!name) err &= exitCode('NONAME');
if (!freq) err &= exitCode('NOFREQ');
if (!db.conn) err &= exitCode('DBDOWN');
if (err > 0) {
  await db.close();
  process.exit(err);
}

// fetch collection
const dbFetch = db.conn.collection('fetch');
let last;
err = 0;

try {

  let json, id;

  // recent DB record available?
  try {
    const res = await dbFetch.find({ name }).sort({ date: -1 }).limit(1);
    last = (await res.hasNext()) ? new Date( (await res.next()).date ) : 0;
  }
  catch (e) { throw new Error('DBFIND'); }

  // found or fetch API data
  if (last > nowOffset(-freq)) {
    throw new Error('FOUND');
  }
  else {

    try {
      json = await fetchJSON(url);
    }
    catch(e) { throw new Error('FETCH'); }

  }

  // JSON available to store
  if (json) {

    try {
      last = new Date();
      const res = await dbFetch.insertOne({ name, date: last, data: json });
      id = res.insertedId || null;
    }
    catch (e) { throw new Error('DBSAVE'); }

  }

  // delete older records
  if (id) {

    try {

      // older than retain days / or all but current record
      const cond = retain ? { name, date: { $lt: nowOffset(-retain * 86400) } } : { name, _id: { $ne: id } };
      await dbFetch.deleteMany(cond);

    }
    catch(e) { throw new Error('DBDEL'); }

  }

  err = exitCode('DONE');

}
catch (e) {
  err = exitCode( e.message );
}

// close database
await db.close();

// complete
process.exit(err);


// show message and return exit code
function exitCode(code) {
  let e = error.get(code);
  if (e) {

    // number of seconds before next update
    const next = !e.code && last ? ' NEXT:' + (freq - Math.floor((+new Date() - last) / 1000)) : '';

    // status message
    console.log(`${ e.code ? 'ERROR' : 'DONE '} ${ pad(e.code, 3) }: ${ e.msg } [${ code }]${ next }`);
    return e.code;
  }
  else {
    console.log(`ERROR   1: unknown [${ code }]`);
    return 1;
  }
}
