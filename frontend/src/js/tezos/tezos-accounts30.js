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
      return (`<h2 part="accounts-title" class="label">XTZ ${ util.lang('accounts') }<span part="accounts-subtitle" class="sub">${ util.lang('month') }<span></h2><table><tbody><tr><th part="accounts-new30label">${ util.lang('new') }</th><td part="accounts-new30">${ this.renderNumber( this.xtzaccount.new30 ) }</td></tr><tr><th part="accounts-fund30label">${ util.lang('funded') }</th><td part="accounts-fund30">${ this.renderNumber( this.xtzaccount.fund30 ) }</td></tr><tr><th part="accounts-cleared30label">${ util.lang('cleared') }</th><td part="accounts-cleared30">${ this.renderNumber( this.xtzaccount.cleared30 ) }</td></tr></tbody></table>`);

    }

    // update values
    this.#dom.update('[part=accounts-title]', `XTZ ${ util.lang('accounts') }` );
    this.#dom.update('[part=accounts-subtitle]', util.lang('month') );
    this.#dom.update('[part=accounts-new30label]', util.lang('new') );
    this.#dom.update('[part=accounts-fund30label]', util.lang('funded') );
    this.#dom.update('[part=accounts-cleared30label]', util.lang('cleared') );

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
