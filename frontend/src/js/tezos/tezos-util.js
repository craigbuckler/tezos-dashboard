// Tezos utility functions
import tezosReducer from './tezos-reducer.js';


// string functions
export const string = {

  // minify string
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

  zone: [
    // https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
    'UTC',
    'Europe/London',
    'Europe/Paris',
    'Europe/Zurich',
    'Europe/Athens',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Melbourne',
    'US/Pacific',
    'US/Mountain',
    'US/Central',
    'US/Eastern'
  ],

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
    },

    // DD MMM
    daymonth(date, timeZone) {
      return datetimeFormat(date, { timeZone, day: 'numeric', month: 'short' });
    }

  }

};


// localised number function
export const number = {

  round(value, dp = 3) {

    const f = 10 ** dp;
    return Math.round(value * f) / f;

  },

  format(value, notation, round) {

    round = (typeof round === 'undefined' ? (value > 100 ? 0 : 2) : round);

    const opt = {
      minimumFractionDigits: round,
      maximumFractionDigits: round,
    };

    if (notation) opt.notation = notation;

    return Intl.NumberFormat(
      tezosReducer.locale || [], opt
    ).format( value );
  }

};


// localised currency function
export const currency = {

  format(value, currency) {
    return Intl.NumberFormat(
      tezosReducer.locale || [],
      { style: 'currency', currency, maximumFractionDigits: (value > 100 ? 0 : 2) }
    ).format( value );
  }

};


// localised percent function
export const percent = {

  format(value, round, sign) {

    round = (typeof round === 'undefined' ? (value > 100 ? 0 : 2) : round);
    const opt = {
      style: 'percent',
      minimumFractionDigits: round,
      maximumFractionDigits: round,
    };
    if (sign) opt.signDisplay = 'exceptZero';

    return Intl.NumberFormat(
      tezosReducer.locale || [], opt
    ).format( value );
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
      if (d.node.hasAttribute('value')) d.node.setAttribute('value', value);
    }

  }

}


// DOM utility functions
export const dom = {

  // remove all child elements
  clean(node) {
    while (node.lastChild) node.removeChild(node.lastChild);
  },

  // append elements in string or fragment to node
  add(node, block) {

    if (typeof block === 'undefined') return;

    // convert string to DOM elements
    if (typeof block === 'string') {

      const
        div = document.createElement('div'),
        frag = new DocumentFragment();

      div.innerHTML = block;
      while (div.childElementCount) {
        frag.appendChild(div.firstElementChild);
      }

      block = frag;

    }

    node.appendChild( block );
    return node.lastChild;

  }

};


// CSS utility functions
export const css = {

  // sets an active class and unsets any non-active
  setClass(node, active, nonActive = []) {

    nonActive.forEach( c => { if (c !== active) node.classList.remove(c); } );
    if (active) node.classList.add(active);

  }

};


// debounce event
export function debounce(fn, delay = 300) {

  let timer = null;
  return function() {
    clearTimeout(timer);
    timer = setTimeout( fn.bind(this, ...arguments), delay );
  };

}
