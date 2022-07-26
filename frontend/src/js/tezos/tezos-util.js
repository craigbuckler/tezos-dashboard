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


// localised currency functions
export const currency = {

  format(value, currency) {
    return Intl.NumberFormat(
      tezosReducer.locale || [],
      { style: 'currency', currency, maximumFractionDigits: (value > 100 ? 0 : 2) }
    ).format( value );
  }

};


// localised percent functions
export const percent = {

  format(value) {
    return Intl.NumberFormat(
      tezosReducer.locale || [],
      { style: 'percent', signDisplay: 'exceptZero', maximumFractionDigits: (value >= 100 ? 0 : 1) }
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
    node.classList.add(active);

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
