/*
Tezos reducer
Fetches API data and distributes to widgets
*/

import { stateZ } from 'statez';

const
  state = stateZ({ name: 'tezosReducer' }),
  observeList = new Set();

// pass reducers to observe and return initial values
export function observeReducer( prop ) {

  observeList.add( prop );
  return state[ prop ];

}

// local time
setTime();
setInterval(setTime, 30000);
function setTime() {
  state.time = +new Date();
}

export default state;
