/*
Tezos accounts widget
*/
import { TezosWidget } from './tezos-widget.js';
import * as util from './tezos-util.js';

export class TezosAccounts extends TezosWidget {

  // watch for Tezos reducer updates (become properties)
  static get observedReducers() {
    return ['locale', 'xtzaccount'];
  }

  // watch for property/attribute changes
  static get observedAttributes() {
    return Object.keys( this.attribute );
  }

  // attribute configuration
  static get attribute() {

    return {

      'format': {
        type    : 'select',
        options : [
          { label: 'standard', value: '' },
          'compact',
          'scientific'
        ]
      }

    };

  }


  #dom = null;


  // constructor
  constructor() {
    super();
  }


  // pre-render configuration (can be async)
  preRender() {

    // DOM updater
    this.#dom = new util.DOM( this.shadow );

  }


  // render component (string or DOM elements)
  render(iteration) {

    // first render
    if (iteration === 0) {

      // wipe previously cached DOM nodes
      this.#dom.reset();

      // widget HTML
      return (`<h2 part="accounts-title" class="label">XTZ accounts</h2><table><tbody><tr><th>total</th><td part="accounts-total">${ this.renderNumber( this.xtzaccount.total ) }</td></tr><tr><th>funded</th><td part="accounts-funded">${ this.renderNumber( this.xtzaccount.funded ) }</td></tr><tr><th>non-funded</th><td part="accounts-zero">${ this.renderNumber( this.xtzaccount.zero ) }</td></tr></tbody></table>`);

    }

    // update values
    for (let p in this.xtzaccount) {
      this.#dom.update(`[part=accounts-${ p }]`, this.renderNumber( this.xtzaccount[p] ));
    }

  }

  // format a numeric value
  renderNumber(v) {
    return util.number.format(v, this.format, 0);
  }


}


// register component
window.customElements.define('tezos-accounts', TezosAccounts);
