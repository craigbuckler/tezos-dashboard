/*
Tezos month price widget
*/
import { TezosWidget } from './tezos-widget.js';
import * as util from './tezos-util.js';
import { Chart } from './tezos-chart.js';

// pre-rendered attribute settings
const attributeConfig = {

  'crypto': {
    label   : 'crypto',
    type    : 'select'
  },

  'currency': {
    label   : 'as currency',
    type    : 'select'
  },

  'zone': {
    label   : 'time zone',
    type    : 'select',
    options : util.datetime.zone
  }

};


// component class
export class TezosMonthChart extends TezosWidget {

  // watch for Tezos reducer updates (become properties)
  static get observedReducers() {
    return ['locale', 'currentmonth', 'exchange'];
  }

  // watch for property/attribute changes
  static get observedAttributes() {
    return Object.keys( this.attribute );
  }

  // attribute configuration
  static get attribute() {
    return attributeConfig;
  }


  // constructor
  constructor() {
    super();
  }


  // pre-render configuration (can be async)
  preRender() {

    // crypto options
    if (this.currentmonth) {
      attributeConfig.crypto.options = [];
      for (let c in this.currentmonth) {
        const n = this.currentmonth[c]?.name;
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

      labels: this.currentmonth.date.map(d => this.renderDate( new Date(d)) ),
      series: [
        {
          id: this.crypto,
          name: this.currentmonth[ this.crypto ].name,
          data: this.currentmonth[ this.crypto ].price.map(p => p / this.exchange[ this.currency ].rate)
        }
      ],
      seriesFormat: v => this.renderCurrency(v),
      aspect: 3/2

    });

    // widget HTML
    const svg = chart.line({
      showArea: true,
      gridXsplit: 3,
      gridYsplit: 4
    });

    return (`<h2 part="monthchart-crypto" class="label">${ this.renderCrypto() }</h2>${ svg }`);

  }


  // crypto currency label
  renderCrypto() {

    const c = this?.currentmonth?.[ this.crypto ];
    if (!c || !c.price.at(0)) return this.crypto || '';

    const
      p = (c.price.at(-1) - c.price.at(0)) / c.price.at(0),
      pc = p > 0 ? 'up' : (p < 0 ? 'dn' : '');

    return `${ this.crypto } month: <span class="${ pc }">${ util.percent.format(p, 1, true) }</span>`;

  }

  // crypto price
  renderCurrency(v) {
    return util.currency.format(v, this.currency);
  }

  // format date value
  renderDate(d) {
    return util.datetime.formatDate.daymonth( d, this.zone );
  }

}

// register component
window.customElements.define('tezos-monthchart', TezosMonthChart);
