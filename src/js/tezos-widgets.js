// Tezos widget imports

// state library
import { stateZ } from 'statez';

// reducer state
import tezosReducer, { observeReducer } from './tezos/tezos-reducer.js';

// utilities
import * as util from './tezos/tezos-util.js';

// base class
import { TezosWidget } from './tezos/tezos-widget.js';

// widget classes
import { TezosTime } from './tezos/tezos-time.js'; // localized datetime

// export public methods for use in other code
export { stateZ, tezosReducer, observeReducer, TezosTime, TezosWidget, util };
