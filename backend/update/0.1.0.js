// database update
import { execCmd } from '../lib/lib.js';

export default [

  // setting indexes
  async db => {

    return {
      detail: 'create setting index',
      result: await db.collection('setting').createIndex({ name: 1 })
    };

  },


  // fetch indexes
  async db => {

    const fetch = db.collection('fetch');

    return {
      detail: 'create fetch indexes',
      result: (
        await fetch.createIndex({ name: 1 }) &&
        await fetch.createIndex({ date: -1 })
      )
    };

  },


  // reduce indexes
  async db => {

    const reduce = db.collection('reduce');

    return {
      detail: 'create reduce indexes',
      result: (
        await reduce.createIndex({ name: 1 }) &&
        await reduce.createIndex({ date: -1 })
      )
    };

  },


  // fetch last 60 days of price data
  async () => {

    return {
      detail: 'fill 60 days of crypto price data',
      result: await execCmd('node --no-warnings ./tasks/fillprice.js -retain=60', 60)
    };

  }

];
