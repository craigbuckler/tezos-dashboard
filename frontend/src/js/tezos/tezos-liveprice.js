/*
Tezos live price widget
*/
import { TezosWidget } from './tezos-widget.js';
import * as util from './tezos-util.js';

import styleBase from './css/tezos-liveprice-base.css';

// pre-rendered attribute settings
const attributeConfig = {

  'crypto': {
    type    : 'select'
  },

  'currency': {
    type    : 'select'
  },

  'increase': {
    label   : 'change',
    type    : 'checkbox'
  }

};

// component class
export class TezosLivePrice extends TezosWidget {

  // watch for Tezos reducer updates (become properties)
  static get observedReducers() {
    return ['locale', 'current', 'current1', 'exchange'];
  }

  // watch for property/attribute changes
  static get observedAttributes() {
    return Object.keys( this.attribute ).concat('noconfig');
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
  #changeNode = null;
  #priceNow = null;
  #priceLast = null;

  // constructor
  constructor() {
    super();
  }


  // pre-render configuration (can be async)
  preRender() {

    // DOM updater
    this.#dom = new util.DOM( this.shadow );

    // crypto options
    if (this.current) {
      attributeConfig.crypto.options = [];
      for (let c in this.current) {
        attributeConfig.crypto.options.push({ label: this.current[c]?.name || c, value: c });
      }
    }

    // currency exchange options
    if (this.exchange) {
      attributeConfig.currency.options = [];
      for (let e in this.exchange) {
        attributeConfig.currency.options.push({ label: (this.exchange[e]?.symbol + ' ' + e).trim(), value: e });
      }
      attributeConfig.currency.options.sort((a, b) => a.value > b.value ? 1 : -1);
    }

  }


  // render component (string or DOM elements)
  render(iteration, propChange, dataChange) {

    // reset last price
    if (propChange?.crypto || propChange?.currency || dataChange?.current1) {
      this.#priceLast = this.current1[ this.crypto ].price / this.exchange[ this.currency ].rate;
    }

    // first render
    if (iteration === 0) {

      // wipe previously cached DOM nodes
      this.#dom.reset();

      // widget HTML
      return (`<h2 part="liveprice-crypto" class="label">${ this.renderCrypto() }</h2><p part="liveprice-price" class="data">${ this.renderPrice() }</p><p part="liveprice-change" class="change">${ this.increase ? this.renderChange() : '' }</p>`);

    }

    // update values
    if (propChange?.crypto) this.#dom.update('.label', this.renderCrypto());
    this.#dom.update('.data', this.renderPrice());
    this.#dom.update('.change', (this.increase ? this.renderChange() : ''));

  }


  // modify changed node colour
  postRender() {

    this.#changeNode = this.changeNode || this.shadow.querySelector('.change');
    if (this.increase) {
      util.css.setClass(this.#changeNode, (this.#priceNow > this.#priceLast ? 'up' : 'dn'), ['up', 'dn']);
    }

  }

  // crypto currency label
  renderCrypto() {
    return this?.current?.[ this.crypto ]?.name || this.crypto;
  }

  // crypto price
  renderPrice() {

    this.#priceNow = (this.current[ this.crypto ].price / this.exchange[ this.currency ].rate) || '-';
    return util.currency.format(this.#priceNow, this.currency);

  }

  // increase/decrease percentage
  renderChange() {

    let inc = 0;

    if (this.#priceLast) {
      // calculate percentage change
      inc = ((this.#priceNow - this.#priceLast) / this.#priceLast);
    }
    else {
      // last price based on current
      this.#priceLast = this.#priceNow;
    }

    return util.percent.format(inc, 1, true);

  }

}

// register component
window.customElements.define('tezos-liveprice', TezosLivePrice);
