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
  yesterday's average prices
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
  XTZ/BTC/ETH daily price
  [
    1.50, // yesterday
    1.51, // 2 days ago
    1.49, // 3 days ago
    ...
  ]
  */
  xtzday: {
    detail: 'reduce average daily XTZ prices',
    fetch:  [ 'xtzday' ],
    reduce: fetch => reduceDay(fetch?.xtzday)
  },

  btcday: {
    detail: 'reduce average daily BTC prices',
    fetch:  [ 'btcday' ],
    reduce: fetch => reduceDay(fetch?.btcday)
  },

  ethday: {
    detail: 'reduce average daily ETH prices',
    fetch:  [ 'ethday' ],
    reduce: fetch => reduceDay(fetch?.ethday)
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
    max = 28,
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
