/*
Tezos time widget
*/
import { TezosWidget } from './tezos-widget.js';
import * as util from './tezos-util.js';

class TezosTime extends TezosWidget {

  // watch for Tezos reducer updates (become properties)
  static get observedReducers() {
    return ['locale', 'time'];
  }

  // watch for property/attribute changes
  static get observedAttributes() {
    return Object.keys( this.attribute );
  }

  // attribute configuration
  static get attribute() {

    return {

      'zone': {
        label   : 'time zone',
        type    : 'select',
        options : [ // https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
          'UTC',
          'Europe/London',
          'Europe/Paris',
          'Europe/Zurich',
          'Europe/Athens',
          'Asia/Singapore',
          'Asia/Tokyo',
          'Australia/Melbourne',
          'US/Pacific',
          'US/Mountain',
          'US/Central',
          'US/Eastern'
        ]
      },

      'date': {
        type    : 'select',
        options : [
          { label: 'none', value: '' },
          'short',
          'medium',
          'long'
        ],

      },

      'hour12': {
        label   : '12-hour',
        type    : 'checkbox'
      }

    };

  }

  // styles
  static get styleBase() {

    return `
      .data, .date {
        padding: 0.1em 0.2em;
      }

      .date {
        font-family: var(--tz-font-head);
        text-align: center;
        color: var(--tz-color-info1);
      }
    `;

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

    console.log('render iteration:', iteration, propChange !== null, dataChange !== null);

    for(let p in propChange) {
      console.log(`  prop.${ p }: was ${ propChange[p].valueOld } now ${ propChange[p].value }`);
    }

    for(let p in dataChange) {
      console.log(`  data.${ p }: was ${ dataChange[p].valueOld } now ${ dataChange[p].value }`);
    }

    // first/changed render
    if (iteration === 0 || propChange) {

      this.#dom.reset();

      // time font size based on widget width
      const
        compStyle = window.getComputedStyle(this),
        widthProp = Math.floor( window.innerWidth / parseFloat(compStyle.getPropertyValue('width')) );

      this.styleDynamic = `
        .data { font-size: ${ Math.max(2, 10 - widthProp) }vw; }
      `;

      return (`
        <h2 class="label">${ this.renderZone() }</h2>
        <time class="data">${ this.renderTime() }</time>
        ` + (this.date ? `<time class="date">${ this.renderDate() }</time>` : '')
      );

    }

    // update time and date
    this.#dom.update('.data', this.renderTime());
    if (this.date) this.#dom.update('.date', this.renderDate());

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
    const dateFn = util.datetime.formatDate[ this.date ] || util.datetime.formatDate.medium;
    return dateFn( this.time, this.zone );
  }

}

// register component
window.customElements.define('tezos-time', TezosTime);
