/*
Tezos time widget
<tezos-time zone="" size="" showdate="1"></tezos-time>
*/
import { TezosWidget } from './tezos-widget.js';
import * as util from './tezos-util.js';

class TezosTime extends TezosWidget {

  // watch for property/attribute changes
  static get observedAttributes() {
    return ['zone', 'hour12', 'showdate'];
  }

  // watch for Tezos reducer updates (become properties)
  static get observedReducers() {
    return ['locale', 'time'];
  }

  // supported timezones
  // https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  static get timeZones() {
    return [
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
    ];
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

      return (`
        <h2 class="label">${ this.renderZone() }</h2>
        <time class="time">${ this.renderTime() }</time>
        ` + (this.showdate ? `<time class="date">${ this.renderDate() }</time>` : '')
      );

    }

    // update time and date
    this.#dom.update('.time', this.renderTime());
    if (this.showdate) this.#dom.update('.date', this.renderDate());

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
    const dateFn = util.datetime.formatDate[ this.showdate ] || util.datetime.formatDate.medium;
    return dateFn( this.time, this.zone );
  }

}

// register component
window.customElements.define('tezos-time', TezosTime);
