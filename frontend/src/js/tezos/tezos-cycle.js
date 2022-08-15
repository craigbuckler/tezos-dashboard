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
    return Object.keys( this.attribute ).concat('noconfig');
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
      return (`<h2 part="cycle-title" class="label">XTZ ${ util.lang('cycle') } <span part="cycle-cycle">${ this.renderNumber( this.xtzcycle.cycle ) }</span></h2><table><tbody><tr><th part="cycle-startlabel">${ util.lang('start') }</th><td part="cycle-start">${ this.renderDate( this.xtzcycle.start ) }</td></tr><tr><th part="cycle-endlabel">${ util.lang('end') }</th><td part="cycle-end">${ this.renderDate( this.xtzcycle.end ) }</td></tr><tr><th part="cycle-bakerslabel">${ util.lang('bakers') }</th><td part="cycle-bakers">${ this.renderNumber( this.xtzcycle.bakers ) }</td></tr><tr><th part="cycle-progresslabel">${ util.lang('progress') }</th><td part="cycle-progress">${ this.renderPercent( this.xtzcycle.progress / 100, 1 ) }</td></tr></tbody></table><progress part="cycle-progressbar" max="100" value="${ this.xtzcycle.progress }" />`);

    }

    // update values
    this.#dom.update('[part=cycle-title]', `XTZ ${ util.lang('cycle') } ` );
    this.#dom.update('[part=cycle-cycle]', this.renderNumber( this.xtzcycle.cycle ));

    this.#dom.update('[part=cycle-startlabel]', util.lang('start'));
    this.#dom.update('[part=cycle-start]', this.renderDate( this.xtzcycle.start ));

    this.#dom.update('[part=cycle-endlabel]', util.lang('end'));
    this.#dom.update('[part=cycle-end]', this.renderDate( this.xtzcycle.end ));

    this.#dom.update('[part=cycle-bakerslabel]', util.lang('bakers'));
    this.#dom.update('[part=cycle-bakers]', this.renderNumber( this.xtzcycle.bakers ));

    this.#dom.update('[part=cycle-progresslabel]', util.lang('progress'));
    this.#dom.update('[part=cycle-progress]', this.renderPercent( this.xtzcycle.progress / 100, 1 ));
    this.#dom.update('[part=cycle-progressbar]', this.xtzcycle.progress);

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
