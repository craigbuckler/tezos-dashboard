/*
get missing crypto price data

example:
  node ./tasks/fillprice.js -retain=30

where:

  -retain : fill N days of data

*/
import 'dotenv/config';
import args from '../lib/args.js';
import { dateDayAdd, fetchJSON } from '../lib/lib.js';
import * as db from '../lib/db.js';

const
  name = 'cryptovalue',
  coin = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
    { id: 'tezos', symbol: 'XTZ', name: 'Tezos' }
  ],
  retain = args.option.retain || 1,
  inserted = [],
  dbFetch = db.conn.collection('fetch');

// analyse days
for (let d = 0; d <= retain; d++) {

  let
    dayStart = dateDayAdd(null, -d),
    dayEnd = dateDayAdd(dayStart, 1);

  try {

    // data exists during day?
    const count = await dbFetch.countDocuments({
      name,
      $and: [
        { date: { $gte: dayStart } },
        { date: { $lt: dayEnd } }
      ]
    });

    if (!count) {

      // fetch historic values
      const
        data = [],
        param = `/history?interval=d1&start=${ +dayStart }&end=${ +dayEnd }`,
        res = await Promise.allSettled(
          coin.map(c => fetchJSON(`https://api.coincap.io/v2/assets/${ c.id }${ param }`))
        );

      // create object
      res.forEach((r, i) => {
        if (r.status === 'fulfilled' && r?.value?.data[0]?.priceUsd) {
          data[i] = { ...coin[i] };
          data[i].priceUsd = r.value.data[0].priceUsd;
        }
      });

      // store
      if (data.length) {
        const update = await dbFetch.insertOne({ name, date: dayStart, data: { data } });
        if (update?.insertedId) inserted.push(dayStart);
      }

    }

  }
  catch(e) {
    console.log(e);
  }

}

// close database
await db.close();

// output
if (inserted.length) {
  console.log(`${ inserted.length } records inserted:`);
  console.log( inserted );
}
