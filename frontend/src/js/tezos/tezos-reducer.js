/*
Tezos reducer
Fetches API data and distributes to widgets

TODO: fetch every 10 minutes
*/

import { stateZ } from 'statez';

const
  api = '/api/?reducer=',
  state = stateZ({ name: 'tezosReducer' }),
  observeList = new Set();

// initial states
observeList.add('time');
observeList.add('locale');

state.timestamp = 0;

// pass reducers to observe and return initial values
export async function observeReducers( props ) {

  const value = {};
  let propFetch = [];

  // determine new properties
  props.forEach(p => {
    if (observeList.has( p )) {
      value[ p ] = state[ p ];
    }
    else {
      observeList.add( p );
      propFetch.push( p );
    }
  });

  // get API values
  if (propFetch.length) {

    await reducerFetch( propFetch );

    propFetch.forEach(p => {
      value[ p ] = state[ p ];
    });

  }

  return value;

}

// local time
setTime();
setInterval(setTime, 30000);
function setTime() {
  state.time = +new Date();
}


// fetch updated reducer values from API
async function reducerFetch( reducers ) {

  let timestamp = 0;

  // run all reducers
  if (!reducers || !Array.isArray(reducers)) {
    reducers = [...observeList];
    timestamp = state.timestamp;
  }

  try {

    const
      res = await fetch(
        `${ api }${ reducers.join(',') }&timestamp=${ timestamp }`,
        {
          method: 'GET',
          cache: 'default'
        }
      ),
      update = await res.json();

    console.dir(update, { depth: null, color: true });

    // store updates
    for (let prop in update) {
      state[ prop ] = update[ prop ];
    }

  }
  catch(e) {}

}

export default state;
