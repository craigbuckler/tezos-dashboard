/*
Tezos reducer
Fetches API data and distributes to widgets
*/

import { stateZ } from 'statez';

const
  api = '__meta_api__?reducer=',
  state = stateZ({ name: 'tezosReducer' }),
  observeList = new Set(),                    // observed reducers passed to API
  ignoreSet = new Set(['locale', 'time']);    // non-API reducers

state.timestamp = 0;


// pass reducers to observe and return initial values
export async function observeReducers( props ) {

  const value = {};
  let propFetch = [];

  // determine new properties
  props.forEach(p => {
    if (observeList.has( p ) || ignoreSet.has( p )) {
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


// local time updated every 30 seconds
setTime();
setInterval(setTime, 30000);
function setTime() {
  state.time = +new Date();
}


// reducer update every 10 minutes
setInterval(reducerFetch, 600000);


// fetch updated reducer values from API
async function reducerFetch( reducers ) {

  let timestamp = 0;

  // run all reducers
  if (!reducers || !Array.isArray(reducers)) {
    reducers = [...observeList];
    timestamp = state.timestamp;
  }

  console.log(`API call: ${ reducers.join(',') } ; ${ timestamp }`);

  if (!reducers.length) return;

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

    // store updates
    for (let prop in update) {
      state[ prop ] = update[ prop ];
    }

  }
  catch(e) {}

}

export default state;
