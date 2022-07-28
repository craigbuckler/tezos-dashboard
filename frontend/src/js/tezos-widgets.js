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
import { TezosTime } from './tezos/tezos-time.js';            // localized datetime
import { TezosLivePrice } from './tezos/tezos-liveprice.js';  // live currency price
import { TezosAccounts } from './tezos/tezos-accounts.js';    // Tezos accounts
import { TezosCycle } from './tezos/tezos-cycle.js';          // Tezos cycle

// export public methods for use in other code
export {
  stateZ,
  tezosReducer,
  util,
  observeReducers,
  TezosTime,
  TezosLivePrice,
  TezosAccounts,
  TezosCycle,
  TezosWidget
};
