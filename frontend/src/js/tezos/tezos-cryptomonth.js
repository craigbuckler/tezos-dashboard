/*
Tezos month price widget
*/
import { TezosWidget } from './tezos-widget.js';
import * as util from './tezos-util.js';
import { Chart } from './tezos-chart.js';

// pre-rendered attribute settings
const attributeConfig = {

  'zone': {
    label   : 'time zone',
    type    : 'select',
    options : util.datetime.zone
  }

};


// component class
export class TezosCryptoMonth extends TezosWidget {

  // watch for Tezos reducer updates (become properties)
  static get observedReducers() {
    return ['locale', 'currentmonth'];
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


  // render component
  render() {

    const cm = this.currentmonth, series = [];

    // format data as percentage change from first day
    for (const c in cm) {

      if (cm[c].name && cm[c].price) {

        const
          base = cm[c].price[0],
          data = cm[c].price.map(d => base ? (d - base) / base : 0);

        series.unshift({
          id: c,
          name: cm[c].name,
          data
        });

      }

    }

    // create chart
    const chart = new Chart({

      labels: this.currentmonth.date.map(d => this.renderDate( new Date(d)) ),
      series,
      seriesFormat: p => util.percent.format(p, 0, true),
      aspect: 3/2

    });

    // widget HTML
    const svg = chart.line({
      showArea: false,
      showLegend: true,
      gridXsplit: 3,
      gridYsplit: 1
    });

    return (`<h2 part="cryptomonth-head" class="label">Month comparison</h2>${ svg }`);

  }

  // format date value
  renderDate(d) {
    return util.datetime.formatDate.daymonth( d, this.zone );
  }

}

// register component
window.customElements.define('tezos-cryptomonth', TezosCryptoMonth);
