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
import { pad, nowOffset } from '../lib/lib.js';
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
  [ 'DBDEL',    { code:   0, msg: 'database delete failure' } ],

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
  db.close();
  process.exit(err);
}

// fetch collection
err = 0;
const dbFetch = db.conn.collection('fetch');

try {

  let recent = 1, json, id;

  // recent DB record available?
  try {
    recent = await dbFetch.countDocuments({ name, date: { $gt: nowOffset(-freq) }});
  }
  catch (e) { throw new Error('DBFIND'); }

  // fetch data API
  if (recent) {
    throw new Error('FOUND');
  }
  else {

    try {
      const res = await fetch(url);
      json = await res.json();
    }
    catch(e) { throw new Error('FETCH'); }

  }

  // JSON available
  if (json) {

    try {
      const res = await dbFetch.insertOne({ name, date: nowOffset(), data: json });
      id = res.insertedId || null;
    }
    catch (e) { throw new Error('DBSAVE'); }

  }

  // database updated
  if (id) {

    try {

      if (retain) {
        // delete records older than retain days
        await dbFetch.deleteMany({ name, date: { $lt: nowOffset(-retain * 86400) } });
      }
      else {
        // delete all but current record
        await dbFetch.deleteMany({ name, _id: { $ne: id } });
      }

    }
    catch(e) { throw new Error('DBDEL'); }

  }

  err = exitCode('DONE');

}
catch (e) {
  err = exitCode( e.message );
}

// close database
db.close();

// complete
process.exit(err);


// show message and return exit code
function exitCode(code) {
  let e = error.get(code);
  if (e) {
    console.log(`${ e.code ? 'ERROR' : 'DONE '} ${ pad(e.code, 3) }: ${ e.msg } [${ code }]`);
    return e.code;
  }
  else {
    console.log(`ERROR   1: unknown [${ code }]`);
    return 1;
  }
}
