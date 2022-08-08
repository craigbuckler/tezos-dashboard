/*
Tezos block solve time widget
*/
import { TezosWidget } from './tezos-widget.js';
import * as util from './tezos-util.js';

export class TezosBlockSolve extends TezosWidget {

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

      'warning': {
        type    : 'number',
        min     : 31,
        max     : 60,
        value   : 33
      }

    };

  }


  #dom = null;
  #solvetimeNode = null;

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
      return (`<h2 part="cycle-title" class="label">XTZ ${ util.lang('block') }<span part="cycle-subtitle" class="sub">${ util.lang('solve') } (${ util.lang('seconds') })</span></h2><table><tbody><tr><th part="cycle-solvetimelabel">${ util.lang('average') }</th><td part="cycle-solvetime">${ this.renderNumber( this.xtzcycle.solvetime, 1 ) }</td></tr><tr><th part="cycle-solveminlabel">${ util.lang('minimum') }</th><td part="cycle-solvemin">${ this.renderNumber( this.xtzcycle.solvemin, 1 ) }</td></tr><tr><th part="cycle-solvemaxlabel">${ util.lang('maximum') }</th><td part="cycle-solvemax">${ this.renderNumber( this.xtzcycle.solvemax, 1 ) }</td></tr></tbody></table>`);

    }

    // update values
    this.#dom.update('[part=cycle-title]', `XTZ ${ util.lang('block') }` );
    this.#dom.update('[part=cycle-subtitle]', `${ util.lang('solve') } (${ util.lang('seconds') })` );

    this.#dom.update('[part=cycle-solvetimelabel]', util.lang('average'));
    this.#dom.update('[part=cycle-solvetime]', this.renderNumber( this.xtzcycle.solvetime, 1 ));

    this.#dom.update('[part=cycle-solveminlabel]', util.lang('minimum'));
    this.#dom.update('[part=cycle-solvemin]', this.renderNumber( this.xtzcycle.solvemin, 1 ));

    this.#dom.update('[part=cycle-solvemaxlabel]', util.lang('maximum'));
    this.#dom.update('[part=cycle-solvemax]', this.renderNumber( this.xtzcycle.solvemax, 1 ));

  }


  // solve warning style
  postRender() {

    this.#solvetimeNode = this.solvetimeNode || this.shadow.querySelector('[part=cycle-solvetime]');
    util.css.setClass(this.#solvetimeNode, (this.xtzcycle.solvetime >= (parseFloat(this.warning) || 35) ? 'dn' : ''), ['dn']);

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
window.customElements.define('tezos-blocksolve', TezosBlockSolve);
