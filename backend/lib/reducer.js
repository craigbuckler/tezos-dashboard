// reducer functions
import { dateDayAdd } from './lib.js';

export default {

  /*
  USD exchange rates
  returns: USD, GBP, EUR, SEK, RUB, SGD, CNY, JPY
  {
    USD: { "symbol" : "$", "rate": 1 },
    GBP: { "symbol" : "£", "rate": 1.1978 },
    ...
  }
  */
  exchange: {

    detail: 'reduce exchange rate data',
    fetch:  [ 'exchange:0' ],
    reduce: fetch => {

      const ex = fetch?.exchange?.[0]?.data?.data;
      if (!ex) return;

      const
        data = {},
        currency = [ 'USD','GBP','EUR','SEK','RUB','SGD','CNY','JPY' ];

      ex.forEach(e => {

        if (currency.includes(e.symbol)) {

          data[e.symbol] = {
            symbol: e.currencySymbol,
            rate: parseFloat( e.rateUsd ) || 1
          };
        }

      });

      if (Object.keys(data).length === currency.length) return data;

    }

  },

  /*
  current prices
  {
    XTZ: { "name" : "Tezos", "price": 1.5 },
    BTC: { "name" : "Bitcoin", "price": 20000 },
    ETH: { "name" : "Ethereum", "price": 1350 }
  }
  */
  current: {

    detail: 'reduce current crypto-currency price',
    fetch:  [ 'cryptovalue:0' ],
    reduce: fetch => {

      const price = fetch?.cryptovalue?.[0]?.data?.data;
      if (!price) return;

      const
        data = {},
        coin = [ 'XTZ', 'BTC', 'ETH' ];

      price.forEach(p => {

        if (coin.includes(p.symbol)) {

          data[p.symbol] = {
            name: p.name,
            price: parseFloat( p.priceUsd ) || 0
          };
        }

      });

      if (Object.keys(data).length === coin.length) return data;

    }

  },

  /*
  yesterday's average price
  {
    XTZ: { "price": 1.4 },
    BTC: { "price": 20001 },
    ETH: { "price": 1349 }
  }
  */
  'current1': {

    detail: 'reduce yesterday\'s crypto-currency price',
    fetch:  [ 'xtzday:3', 'btcday:3', 'ethday:3' ],
    reduce: fetch => {

      const
        data = {},
        coin = [ 'xtz', 'btc', 'eth' ];

      coin.forEach(c => {

        const priceDay = fetch?.[c + 'day'];
        if (!priceDay || !priceDay.length) return;

        const price = priceDay.find( p => p?.data?.data?.[0]?.priceUsd );
        if (price) data[ c.toUpperCase() ] = { price: parseFloat(price.data.data[0].priceUsd) || 0 };

      });

      if (Object.keys(data).length === coin.length) return data;

    }

  },

  /*
  XTZ/BTC/ETH prices over past 24 hours
  {
    date: [ <date-1>, <date-2>, ...],
    XTZ: { "name" : "Tezos", "price": [1.70, 1.71, ...] },
    BTC: { "name" : "Bitcoin", "price": [] },
    ETH: { "name" : "Ethereum", "price": [] }
  }
  */
  currentday: {

    detail: 'reduce crypto-currency prices over previous 24 hours',
    fetch:  [ 'cryptovalue:150' ],
    reduce: fetch => {

      const
        dateMax = dateDayAdd(null, -1),
        cv = (fetch.cryptovalue || []).filter(d => d.date >= dateMax ),
        ret = {
          date: []
        };

      cv.forEach(v => {

        // add date stamp
        ret.date.push( parseFloat( +v.date ) );

        // add prices
        v?.data?.data.forEach(c => {

          ret[ c.symbol ] = ret[ c.symbol ] || { name: c.name, price: [] };
          ret[ c.symbol ].price.push( parseFloat( c.priceUsd ) );

        });

      });

      return ret;

    }

  },

  /*
  XTZ/BTC/ETH daily prices over past 30 days (dates are at midnight)
  {
    date: [ <date-1>, <date-2>, ...],
    XTZ: { "name" : "Tezos", "price": [1.70, 1.71, ...] },
    BTC: { "name" : "Bitcoin", "price": [] },
    ETH: { "name" : "Ethereum", "price": [] }
  }
  */
  currentmonth: {

    detail: 'reduce average daily crypto-currency prices for month',
    fetch:  [ 'xtzday:30', 'btcday:30', 'ethday:30' ],
    reduce: fetch => {

      const
        xtz = reduceDay(fetch?.xtzday),
        btc = reduceDay(fetch?.btcday),
        eth = reduceDay(fetch?.ethday);

      if (xtz && btc && eth) return {

        date: fetch.xtzday.map(day => parseFloat( +day.date ) ),
        XTZ: {
          name: 'Tezos',
          price: xtz
        },
        BTC: {
          name: 'Bitcoin',
          price: btc
        },
        ETH: {
          name: 'Etherium',
          price: eth
        }

      };

    }
  },

  /*
  XTZ cycle information
  */
  xtzcycle: {

    detail: 'reduce Tezos cycle information',
    fetch:  [ 'xtzcycle' ],
    reduce: fetch => {

      const cycle = fetch?.xtzcycle?.[0]?.data;
      if (!cycle) return;

      return {
        cycle:      cycle.cycle,
        start:      cycle.start_time,
        end:        cycle.end_time,
        progress:   cycle.progress,
        bakers:     cycle.working_bakers,
        solvetime:  cycle.solvetime_mean,
        solvemin:   cycle.solvetime_min,
        solvemax:   cycle.solvetime_max
      };

    }
  },


  /*
  XTZ accounts information
  */
  xtzaccount: {

    detail: 'reduce Tezos account information',
    fetch:  [ 'xtzblockchain' ],
    reduce: fetch => {

      const chain = fetch?.xtzblockchain?.[0]?.data;
      if (!chain) return;

      return {
        total:      chain.total_accounts,
        funded:     chain.funded_accounts,
        zero:       chain.dust_accounts,
        new30:      chain.new_accounts_30d,
        fund30:     chain.funded_accounts_30d,
        cleared30:  chain.cleared_accounts_30d
      };

    }

  }

};


// ____________________________________
// Reusable functions

// reduce daily averages
function reduceDay(price) {

  if (!price || !price.length) return;

  const
    max = 30,
    data = [],
    date = Array(max).fill(null, 0).map((v, i) => +dateDayAdd(v, -i-1));

  // fetch daily prices
  price.forEach(p => {

    const
      d = p?.date,
      v = parseFloat(p?.data?.data?.[0]?.priceUsd) || null;

    if (!p) return;

    const i = date.indexOf( +d );
    if (i >= 0) data[i] = v;

  });

  // interpolate missing values
  let ns = 0, nsv;
  while (ns < data.length) {

    if (data[ns] !== null) {
      nsv = data[ns];
    }
    else {

      let ne = ns, nev;
      ns--;
      while (!data[ne] && ne < data.length) ne++;
      nev = data[ne] || nsv;
      nsv = nsv || nev;

      for (let n = ns; n < ne; n++) {
        data[n] = nsv && nev ? ((nev - nsv) / (ne - ns)) * (n - ns) + nsv : 0;
      }

      ns = ne;
    }

    ns++;
  }

  if (data.length === max) return data;

}
