/*
Tezos time widget
*/
import { TezosWidget } from './tezos-widget.js';
import * as util from './tezos-util.js';

import styleBase from './css/tezos-time-base.css';

export class TezosTime extends TezosWidget {

  // watch for Tezos reducer updates (become properties)
  static get observedReducers() {
    return ['locale', 'time'];
  }

  // watch for property/attribute changes
  static get observedAttributes() {
    return Object.keys( this.attribute ).concat('noconfig');
  }

  // attribute configuration
  static get attribute() {

    return {

      'zone': {
        label   : 'timezone',
        type    : 'select',
        options : util.datetime.zone
      },

      'date': {
        type    : 'select',
        options : [
          { label: 'none', value: '' },
          'short',
          'medium',
          'long'
        ]
      },

      'hour12': {
        label   : '12-hour',
        type    : 'checkbox'
      }

    };

  }

  // styles
  static get styleBase() {
    return styleBase;
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
  render(iteration, propChange, dataChange) {

    // console.log(this.constructor.name, 'render iteration:', iteration, propChange !== null, dataChange !== null);

    // for(let p in propChange) {
    //   console.log(`  prop.${ p }: was ${ propChange[p].valueOld } now ${ propChange[p].value }`);
    // }

    // for(let p in dataChange) {
    //   console.log(`  data.${ p }: was ${ dataChange[p].valueOld } now ${ dataChange[p].value }`);
    // }

    // first render
    if (iteration === 0) {

      // wipe previously cached DOM nodes
      this.#dom.reset();

      // widget HTML
      return (`<h2 part="time-zone" class="label">${ this.renderZone() }</h2><time part="time-time" class="data">${ this.renderTime() }</time><time part="time-date" class="date">${ this.renderDate() }</time>`);

    }

    // update values
    if (propChange?.zone) this.#dom.update('.label', this.renderZone());
    this.#dom.update('.data', this.renderTime());
    this.#dom.update('.date', this.renderDate());

  }

  // timezone city
  renderZone() {
    const z = this.zone.split('/');
    return (z[1] || z[0]);
  }

  // format time
  renderTime() {
    return util.datetime.formatTime.short( this.time, this.zone, this.hour12 );
  }

  // format date
  renderDate() {
    if (!this.date) return '';
    const dateFn = util.datetime.formatDate[ this.date ] || util.datetime.formatDate.medium;
    return dateFn( this.time, this.zone );
  }

}

// register component
window.customElements.define('tezos-time', TezosTime);
