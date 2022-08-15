/*
Tezos day price widget
*/
import { TezosWidget } from './tezos-widget.js';
import * as util from './tezos-util.js';
import { Chart } from './tezos-chart.js';

// pre-rendered attribute settings
const attributeConfig = {

  'crypto': {
    type    : 'select'
  },

  'currency': {
    type    : 'select'
  },

  'zone': {
    label   : 'timezone',
    type    : 'select',
    options : util.datetime.zone
  }

};


// component class
export class TezosDayChart extends TezosWidget {

  // watch for Tezos reducer updates (become properties)
  static get observedReducers() {
    return ['locale', 'currentday', 'exchange'];
  }

  // watch for property/attribute changes
  static get observedAttributes() {
    return Object.keys( this.attribute ).concat('noconfig');
  }

  // attribute configuration
  static get attribute() {
    return attributeConfig;
  }


  // constructor
  constructor() {
    super();
    this.liveConfigUpdate = false;
  }


  // pre-render configuration (can be async)
  preRender() {

    // crypto options
    if (this.currentday) {
      attributeConfig.crypto.options = [];
      for (let c in this.currentday) {
        const n = this.currentday[c]?.name;
        if (n) attributeConfig.crypto.options.push({ label: n, value: c });
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


  // render component
  render() {

    // create chart
    const chart = new Chart({

      labels: this.currentday.date,
      series: [
        {
          id: this.crypto,
          name: this.currentday[ this.crypto ].name,
          data: this.currentday[ this.crypto ].price.map(p => p / this.exchange[ this.currency ].rate)
        }
      ],
      labelsFormat: d => this.renderTime( new Date(d) ),
      seriesFormat: v => this.renderCurrency(v),
      aspect: 3/2

    });

    // widget HTML
    const svg = chart.line({
      showArea: true,
      gridXsplit: 3,
      gridYsplit: 4
    });

    return (`<h2 part="daychart-crypto" class="label">${ this.renderCrypto() }</h2>${ svg }`);

  }


  // crypto currency label
  renderCrypto() {
    const c = this?.currentday?.[ this.crypto ];
    if (!c || !c.price.at(0)) return this.crypto || '';

    const
      p = (c.price.at(-1) - c.price.at(0)) / c.price.at(0),
      pc = p > 0 ? 'up' : (p < 0 ? 'dn' : '');

    return `${ this.crypto } ${ util.lang('day') }: <span class="${ pc }">${ util.percent.format(p, 1, true) }</span>`;
  }

  // crypto price
  renderCurrency(v) {
    return util.currency.format(v, this.currency);
  }

  // format time value
  renderTime(d) {
    return util.datetime.formatTime.short( d, this.zone );
  }

}

// register component
window.customElements.define('tezos-daychart', TezosDayChart);
