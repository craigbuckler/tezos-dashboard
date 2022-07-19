/*
get previous days of average XTZ, BTC, and ETH values

example:
  node ./tasks/fillday.js -retain=28

where:

  -retain : fill N days of data

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
  retain = -(args.option.retain || 1);


// generate commands
for (let d = -1; d >= retain; d--) {

  coin.forEach(c => {

    exec.push(`node --no-warnings ./tasks/fetch.js -name=${ c.dbname } -date='{day:${ d }}' -retain=60 -freq=43200 'https://api.coincap.io/v2/assets/${ c.id }/history?interval=d1&start={+day:${ d }}&end={+day:${ d+1 }}'`);

  });

}

// run all commands
await Promise.allSettled(
  exec.map(cmd => execCmd(cmd, 30))
);

console.log(`Previous ${ -retain } days of historical data processed`);
