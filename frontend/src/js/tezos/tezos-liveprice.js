/*
Tezos live price widget

TODO: add change value
*/
import { TezosWidget } from './tezos-widget.js';
import * as util from './tezos-util.js';

import styleBase from './css/tezos-liveprice-base.css';

// pre-rendered attribute settings
const attributeConfig = {

  'crypto': {
    label   : 'crypto',
    type    : 'select'
  },

  'currency': {
    label   : 'to currency',
    type    : 'select'
  }

};

// component class
export class TezosLivePrice extends TezosWidget {

  // watch for Tezos reducer updates (become properties)
  static get observedReducers() {
    return ['locale', 'current', 'exchange'];
  }

  // watch for property/attribute changes
  static get observedAttributes() {
    return Object.keys( this.attribute );
  }

  // attribute configuration
  static get attribute() {
    return attributeConfig;
  }

  // styles
  static get styleBase() {
    return styleBase;
  }


  #dom = null;

  // constructor
  constructor() {

    super();

    // DOM updater
    this.#dom = new util.DOM( this.shadow );

  }


  // render component (string or DOM elements)
  render(iteration, propChange, dataChange) {

    console.log(this.constructor.name, 'render iteration:', iteration, propChange !== null, dataChange !== null);

    for(let p in propChange) {
      console.log(`  prop.${ p }: was ${ propChange[p].valueOld } now ${ propChange[p].value }`);
    }

    for(let p in dataChange) {
      console.log(`  data.${ p }: was ${ dataChange[p].valueOld } now ${ dataChange[p].value }`);
    }

    // crypto options
    if (!attributeConfig.crypto.options && this.current) {
      attributeConfig.crypto.options = [];
      for (let c in this.current) {
        attributeConfig.crypto.options.push({ label: this.current[c]?.name || c, value: c });
      }
    }

    // currency exchange options
    if (!attributeConfig.currency.options && this.exchange) {
      attributeConfig.currency.options = [];
      for (let e in this.exchange) {
        attributeConfig.currency.options.push({ label: (this.exchange[e]?.symbol + ' ' + e).trim(), value: e });
      }
      attributeConfig.currency.options.sort((a, b) => a.value > b.value ? 1 : -1);
    }

    // first render
    if (iteration === 0) {

      // wipe previously cached DOM nodes
      this.#dom.reset();

      // widget HTML
      return (`<h2 part="liveprice-crypto" class="label">${ this.renderCrypto() }</h2><p part="liveprice-price" class="data">${ this.renderPrice() }</p><p part="liveprice-change" class="change"></p>`);

    }

    // update values
    if (propChange?.crypto) this.#dom.update('.label', this.renderCrypto());
    this.#dom.update('.data', this.renderPrice());

  }

  // crypto currency label
  renderCrypto() {
    return this?.current?.[ this.crypto ]?.name || this.crypto;
  }

  // crypto price
  renderPrice() {
    const
      usd = this?.current?.[ this.crypto ]?.price,
      exh = this?.exchange?.[ this.currency ]?.rate;
    return usd && exh ? util.currency.format(usd / exh, this.currency) : '-';
  }

}

// register component
window.customElements.define('tezos-liveprice', TezosLivePrice);
