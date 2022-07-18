/*
reducer processing

example:
  node ./tasks/reduce.js -name=exchange -freq=600

where:

  -name   : reducer name
  -freq   : maximum frequency of fetches in seconds

*/
import process from 'node:process';
import 'dotenv/config';
import args from '../lib/args.js';
import reducerConfig from '../lib/reducer.js';
import { pad, nowOffset, dateDayAdd } from '../lib/lib.js';
import * as db from '../lib/db.js';


// error list
const error = new Map([

  // success
  [ 'DONE',     { code:   0, msg: 'success' } ],
  [ 'FOUND',    { code:   0, msg: 'recent data already available' } ],
  [ 'NOUPDATE', { code:   0, msg: 'identical data exists' } ],

  // parameter errors
  [ 'NONAME',   { code: 101, msg: 'no database reference -name specified' } ],
  [ 'NOFREQ',   { code: 102, msg: 'no update frequency -freq specified' } ],

  // runtime errors
  [ 'DBDOWN',   { code: 201, msg: 'database access failure' } ],
  [ 'DBFIND',   { code: 202, msg: 'database find failure' } ],
  [ 'DBFETCH',  { code: 203, msg: 'no database data fetch' } ],
  [ 'DBSAVE',   { code: 204, msg: 'database save failure' } ],
  [ 'NOREDUCE', { code: 205, msg: 'reducer failed' } ],

]);


// validate arguments
let err = -1;

const
  name = args.option.name,
  freq = args.option.freq;

if (!name || !reducerConfig[name]) err &= exitCode('NONAME');
if (!freq) err &= exitCode('NOFREQ');
if (!db.conn) err &= exitCode('DBDOWN');
if (err > 0) {
  await db.close();
  process.exit(err);
}

// fetch collection
const
  reducer = reducerConfig[name],
  dbFetch = db.conn.collection('fetch'),
  dbReduce = db.conn.collection('reduce');

let last, cRec, fetch, data;
err = 0;

try {

  // recent reducer record available?
  try {
    const res = await dbReduce.find({ name }).sort({ date: -1 }).limit(1);
    cRec = await res.hasNext() ? await res.next() : null;

    if (cRec) {
      last = new Date( cRec.date );
    }

  }
  catch (e) { throw new Error('DBFIND'); }

  // found or fetch API data
  if (last > nowOffset(-freq)) {
    throw new Error('FOUND');
  }

  // get all database fetch data
  try {

    fetch = {};

    const rec = await Promise.allSettled(

      reducer.fetch.map(async f => {

        // get name to find
        const
          search = f.split(':'),
          find = { name: search[0] };

        // limit to N days
        if (search[1]) {
          find.date = { $gte: dateDayAdd(null, -(parseFloat(search[1]) || 0)) };
        }

        // query database
        const
          data = [],
          res = await dbFetch.find( find ).sort({ date: -1 });

        while (await res.hasNext()) {
          data.push(await res.next());
        }

        return data;

      })
    );


    // format fetch values
    rec.forEach(r => {

      if (r.status !== 'fulfilled' || !r.value || !r.value.length) return;

      let n = r.value[0].name;
      if (n) {

        fetch[n] = fetch[n] || [];

        r.value.forEach(v => {
          fetch[n].push({
            _id: v._id,
            date: v.date,
            data: v.data
          });
        });

      }

    });

    // no data found?
    if (!Object.keys(fetch).length) {
      throw new Error('DBFETCH');
    }

  }
  catch(e) { throw new Error('DBFETCH'); }


  // reduce data
  if (fetch) {

    try {

      data = reducer.reduce(fetch);
      if (!data) throw new Error('NOREDUCE');

    }
    catch (e) { throw new Error('NOREDUCE'); }

  }


  // store data
  if (data) {

    last = new Date();

    // data identical?
    if (cRec && JSON.stringify(data) === JSON.stringify(cRec.data)) {
      throw new Error('NOUPDATE');
    }

    try {

      const filter = { name };
      if (cRec) filter._id = cRec._id;
      await dbReduce.updateOne(filter, { $set: { name, date: last, data } }, { upsert: true });

    }
    catch (e) { throw new Error('DBSAVE'); }

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
