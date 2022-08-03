// Tezos widget imports

// state library
import { stateZ } from 'statez';

// reducer state
import tezosReducer, { observeReducers } from './tezos/tezos-reducer.js';

// utilities
import * as util from './tezos/tezos-util.js';

// base class
import { TezosWidget } from './tezos/tezos-widget.js';

// widget classes
import { TezosTime } from './tezos/tezos-time.js';              // localized datetime
import { TezosLivePrice } from './tezos/tezos-liveprice.js';    // live currency price
import { TezosAccounts } from './tezos/tezos-accounts.js';      // Tezos accounts
import { TezosAccounts30 } from './tezos/tezos-accounts30.js';  // Tezos accounts (30 days)
import { TezosCycle } from './tezos/tezos-cycle.js';            // Tezos cycle
import { TezosBlockSolve } from './tezos/tezos-blocksolve.js';  // Tezos block solve times

// export public methods for use in other code
export {
  stateZ,
  tezosReducer,
  util,
  observeReducers,
  TezosTime,
  TezosLivePrice,
  TezosAccounts,
  TezosAccounts30,
  TezosCycle,
  TezosBlockSolve,
  TezosWidget
};
