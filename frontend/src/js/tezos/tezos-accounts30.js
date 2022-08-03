/*
Tezos accounts activity over month widget
*/
import { TezosWidget } from './tezos-widget.js';
import * as util from './tezos-util.js';

export class TezosAccounts30 extends TezosWidget {

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
      return (`<h2 part="accounts-title" class="label">XTZ accounts <span class="sub">(monthly activity)<span></h2><table><tbody><tr><th>new</th><td part="accounts-new30">${ this.renderNumber( this.xtzaccount.new30 ) }</td></tr><tr><th>funded</th><td part="accounts-fund30">${ this.renderNumber( this.xtzaccount.fund30 ) }</td></tr><tr><th>cleared</th><td part="accounts-cleared30">${ this.renderNumber( this.xtzaccount.cleared30 ) }</td></tr></tbody></table>`);

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
window.customElements.define('tezos-accounts30', TezosAccounts30);
