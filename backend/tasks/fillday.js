/*
get previous days of average XTZ, BTC, and ETH values

example:
  node ./tasks/fillday.js -retain=28

where:

  -retain : fill N days of data
  -freq   : maximum frequency of fetches in seconds

*/
import 'dotenv/config';
import args from '../lib/args.js';
import { execCmd  } from '../lib/lib.js';

const
  exec = [],
  coin = [
    { id: 'tezos', dbname: 'xtzday' },
    { id: 'bitcoin', dbname: 'btcday' },
    { id: 'ethereum', dbname: 'ethday' }
  ],
  retain = (args.option.retain || 1),
  freq = (args.option.freq || 86400);


// generate commands
for (let d = -1; d >= -retain; d--) {

  coin.forEach(c => {

    exec.push(`node --no-warnings ./tasks/fetch.js -name=${ c.dbname } -date='{day:${ d }}' -retain=${ retain+1 } -freq=${ freq } 'https://api.coincap.io/v2/assets/${ c.id }/history?interval=d1&start={+day:${ d }}&end={+day:${ d+1 }}'`);

  });

}

// run all commands
let res = await Promise.allSettled(
  exec.map(cmd => execCmd(cmd, 30))
);

// filter failed processes
res = res.filter(r => r?.value?.code >= 0 && r?.value?.out);

// sort by error code (highest wins) then shortest NEXT value
res.sort((a, b) => {

  return ( b.value.code - a.value.code ) || ( getNext(a.value.out) - getNext(b.value.out) );

  // get NEXT value
  function getNext(str) {
    const m = str.match(/NEXT:\s*(\d+)/i);
    return (m && m.length === 2 ? parseInt(m[1], 10) : freq);
  }

});


// return first value
if (res.length) {

  let r = res[0].value;
  console.log( r.out );
  process.exit( r.code );

}
else {

  console.log('ERROR   1: no process completed [ERROR]');
  process.exit( 1 );

}
