// Tezos SVG charts
import * as util from './tezos-util.js';

export class Chart {

  // pass labels (array), series (array of { name: 'series', data: [d1, d1, ...], format: fn() })
  constructor(opt) {

    this.labels = opt.labels || [];
    this.series = opt.series || [];

    // options
    this.option = {
      id: opt.id || '',
      class: opt.class || '',
      width:  opt.width || (opt.height ? null : 1600),
      height: opt.height || (opt.width ? null : 1200),
      pad: opt.pad || 0,
      chartYPad: opt.chartYPad || 0.05,
      labelHeight: 0.12,
      seriesFormat: opt.seriesFormat || (v => v)
    };

    const o = this.option;

    // calculate width/height based on aspect ratio
    if (opt.aspect || !this.option.width || !this.option.height) {

      opt.aspect = opt.aspect || 4/3;
      o.width = o.width || o.height * opt.aspect;
      o.height = o.width / opt.aspect;
      o.width = Math.round(o.width);
      o.height = Math.round(o.height);

    }

  }


  // calculate series factors
  #seriesCalc() {

    const min = [], max = [];

    this.series.map(s => {

      s.min = Math.min(...s.data);
      s.max = Math.max(...s.data);
      min.push(s.min);
      max.push(s.max);

      return s;

    });

    const o = this.option;

    o.seriesCount = this.labels.length;
    o.seriesMinValue = Math.min(...min);
    o.seriesMin = o.seriesMinValue - (o.seriesMinValue * o.chartYPad);
    o.seriesMaxValue = Math.max(...max);
    o.seriesMax = o.seriesMaxValue + (o.seriesMaxValue * o.chartYPad);
    o.seriesRange = o.seriesMax - o.seriesMin;

    o.chartXmin = o.width * o.pad;
    o.chartXmax = o.width - o.chartXmin;
    o.chartWidth = o.chartXmax - o.chartXmin;

    o.chartYmin = o.height * o.pad;
    o.chartYmax = o.height - o.chartYmin - (o.height * o.labelHeight);
    o.chartHeight = o.chartYmax - o.chartYmin;

  }


  // render a line chart
  line({
    showArea = false,
    showLegend = false,
    gridXsplit = 1,
    gridYsplit = 1
  } = {}) {

    this.#seriesCalc();

    const
      o = this.option,
      gridXskip = Math.round(o.seriesCount / gridXsplit),
      textOffset = Math.max(o.chartWidth, o.chartHeight) / 50;

    let
      line = [], area = [],
      gridX = '', gridY = '',
      label = '', labelMin = '', labelMax = '';

    // create series paths
    this.series.forEach((series, idx) => {

      line[idx] = '';
      area[idx] = `M${ o.chartXmin },${ o.chartYmax }`;

      series.data.forEach((data, dataIdx) => {

        const
          x = util.number.round( (dataIdx / (o.seriesCount - 1)) * o.chartWidth + o.chartXmin ),
          y = util.number.round( o.chartYmax - (((data - o.seriesMin) / o.seriesRange) * o.chartHeight) );

        // plot line and area
        line[idx] += `${ !dataIdx ? 'M' : ' L' }${ x },${ y }`;
        area[idx] += ` L${ x },${ y }`;

        // grid X-axis and data labels
        if (!idx && dataIdx && !(dataIdx % gridXskip) && (dataIdx + gridXskip - 1 < o.seriesCount)) {
          gridX += ` M${ x },${ o.chartYmin } L${ x },${ o.chartYmax }`;
          label += `<text class="label top center" x="${ x }" y="${ o.chartYmax + textOffset }">${ this.labels[dataIdx] }</text>`;
        }

        // minimum and maximum values
        if (data == o.seriesMinValue) labelMin = this.labels[dataIdx];
        if (data == o.seriesMaxValue) labelMax = this.labels[dataIdx];

      });

      area[idx] += ` L${ o.chartXmax },${ o.chartYmax } L${ o.chartXmin },${ o.chartYmax }`;

    });

    // Y grid
    const yInc = o.chartHeight / gridYsplit;
    for (let y = o.chartYmin + yInc; y < o.chartYmax; y += yInc) {
      gridY += ` M${ o.chartXmin },${ y } L${ o.chartXmax },${ y }`;
    }

    // legend Y position
    const
      legInc = Math.min(90, (o.chartHeight * 0.5) / this.series.length),
      legMin = o.chartYmin + textOffset + (o.chartHeight / 2) - (this.series.length / 2 * legInc);

    // generate SVG
    const svg =
      (showArea ? area.map((path, idx) => `<path class="area series${ idx } ${ this.series[idx].id }" d="${ path }" />`).join('') : '') +
      line.map((path, idx) => `<path class="line series${ idx } ${ this.series[idx].id }" d="${ path }" />`).join('') +
      `<path class="grid" d="${ gridX.trim() }" />` +
      `<path class="grid" d="${ gridY.trim() }" />` +
      `<rect class="grid" x="${ o.chartXmin }" y="${ o.chartYmin }" width="${ o.chartWidth }" height="${ o.chartHeight }" />` +
      `<text class="top right" x="${ o.chartXmax - textOffset }" y="${ o.chartYmin + textOffset }">${ o.seriesFormat( o.seriesMaxValue ) } (${ labelMax })</text>` +
      `<text x="${ o.chartXmin + textOffset }" y="${ o.chartYmax - textOffset }">${ o.seriesFormat( o.seriesMinValue ) } (${ labelMin })</text>` +
      label +
      `<text class="label top" x="${ o.chartXmin + textOffset }" y="${ o.chartYmax + textOffset }">${ this.labels[0] }</text>` +
      `<text class="label top right" x="${ o.chartXmax - textOffset }" y="${ o.chartYmax + textOffset }">${ this.labels.at(-1) }</text>` +
      (showLegend ? this.series.sort((a, b) => b.data.at(-1)-a.data.at(-1)).map((s, idx) => `<text class="legend middle series${ idx } ${ s.id }" x="${ o.chartXmin + textOffset }" y="${ legMin + (idx * legInc)}">${ o.seriesFormat( s.data.at(-1) ) } ${ s.name }</text>`).join('') : '');

    return this.#SVGwrap(svg, 'tezoslinechart');

  }


  // add SVG header and footer
  #SVGwrap(svg, type = '') {

    let
      id = this.option.id,
      className = (this.option.class + ' ' + type).trim();

    if (id) id = ` id="${ id }"`;
    if (className) className = ` class="${ className }"`;

    return `<svg${ id } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ this.option.width } ${ this.option.height }" preserveAspectRatio="xMidYMid meet"${ className }>${ svg }</svg>`;

  }


}
