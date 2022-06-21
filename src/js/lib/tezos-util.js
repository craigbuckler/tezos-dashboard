// Tezos utility functions
import tezosReducer from './tezos-reducer.js';


// reducer data handlers
// e.g. reducerHandler.locale = () => {}
// const reducerHandler = {};
// tezosReducer.addEventListener('change', e => {

//   const fn = reducerHandler[ e.detail.property ];
//   if (fn) fn();

// });


// string functions
export const string = {

  // minify html
  minify(s) {
    return s.trim().replace(/\s*\n\s*/g, '\n');
  }

};


// datetime formatting
function datetimeFormat(date, format) {
  let d = date instanceof Date ? date : new Date(date);
  return Intl.DateTimeFormat( tezosReducer.locale || [], format ).format(d);
}


// localised datetime functions
export const datetime = {

  formatTime: {

    // HH:MM:SS
    long(date, timeZone, hour12) {
      return datetimeFormat(date, { timeZone, 'hour12': !!hour12, hour:'2-digit', minute: '2-digit', second: 'numeric' });
    },

    // HH:MM
    short(date, timeZone, hour12) {
      return datetimeFormat(date, { timeZone, 'hour12': !!hour12, hour:'2-digit', minute: '2-digit' });
    }

  },

  formatDate: {

    // WWWW, D MMMM YYYY
    long(date, timeZone) {
      return datetimeFormat(date, { timeZone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    },

    // D MMMM YYYY
    medium(date, timeZone) {
      return datetimeFormat(date, { timeZone, day: 'numeric', month: 'long', year: 'numeric' });
    },

    // DD/MM/YYYY
    short(date, timeZone) {
      return datetimeFormat(date, { timeZone, dateStyle: 'short' });
    }

  }

};


// DOM updater
// caches nodes and updates content if changed
export class DOM {

  #doc = null;  // document
  #dom = {};    // DOM cache

  // select document
  constructor(doc) {
    this.#doc = doc || window.document;
  }

  // reset DOM cache
  reset() {
    this.#dom = {};
  }

  // update a selector with a value
  update( sel, value ) {

    // cached or new selector
    this.#dom[sel] = this.#dom[sel] || { select: sel };
    const d = this.#dom[sel];

    // select node
    if (typeof d.node === 'undefined') {
      d.node = this.#doc.querySelector( sel );
    }

    // update content
    if (d.node && value !== d.value) {
      d.value = value;
      d.node.textContent = value;
    }

  }

}
