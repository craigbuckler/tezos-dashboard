/*
Tezos cycle widget
*/
import { TezosWidget } from './tezos-widget.js';
import * as util from './tezos-util.js';

export class TezosCycle extends TezosWidget {

  // watch for Tezos reducer updates (become properties)
  static get observedReducers() {
    return ['locale', 'xtzcycle'];
  }

  // watch for property/attribute changes
  static get observedAttributes() {
    return Object.keys( this.attribute );
  }

  // attribute configuration
  static get attribute() {

    return {

      'date': {
        type    : 'select',
        options : [
          'short',
          'medium',
          'long'
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
      return (`<h2 class="label">XTZ cycle <span part="cycle-cycle">${ this.renderNumber( this.xtzcycle.cycle ) }</span></h2><table><tbody><tr><th>start</th><td part="cycle-start">${ this.renderDate( this.xtzcycle.start ) }</td></tr><tr><th>end</th><td part="cycle-end">${ this.renderDate( this.xtzcycle.end ) }</td></tr><tr><th>progress</th><td part="cycle-progress">${ this.renderPercent( this.xtzcycle.progress / 100, 1 ) }</td></tr><tr><th>bakers</th><td part="cycle-bakers">${ this.renderNumber( this.xtzcycle.bakers ) }</td></tr></tbody></table>`);

    }



    // update values
    this.#dom.update('[part=cycle-cycle]', this.renderNumber( this.xtzcycle.cycle ));
    this.#dom.update('[part=cycle-start]', this.renderDate( this.xtzcycle.start ));
    this.#dom.update('[part=cycle-end]', this.renderDate( this.xtzcycle.end ));
    this.#dom.update('[part=cycle-progress]', this.renderPercent( this.xtzcycle.progress / 100, 1 ));
    this.#dom.update('[part=cycle-bakers]', this.renderNumber( this.xtzcycle.bakers ));

  }


  // format a numeric value
  renderNumber(v, dp = 0) {
    return util.number.format(v, null, dp);
  }

  // format a percentage value
  renderPercent(v, dp) {
    return util.percent.format(v, dp);
  }

  // format date value
  renderDate(d) {
    const dateFn = util.datetime.formatDate[ this.date ] || util.datetime.formatDate.short;
    return dateFn( d, 'UTC' );
  }

}


// register component
window.customElements.define('tezos-cycle', TezosCycle);
