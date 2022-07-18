// reducer function
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

  }


};
