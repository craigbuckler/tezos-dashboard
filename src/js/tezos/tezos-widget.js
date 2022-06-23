/*
Tezos Widget class
All widgets must extend from this class
*/

// state
import tezosReducer, { observeReducer } from './tezos-reducer.js';
import * as util from './tezos-util.js';

// widget base styles
import styleBase from './css/tezos-widget-base.css';

// configuration button
const buttonConfig = document.createElement('button');
buttonConfig.classList.add('config');
buttonConfig.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"/><path fill="currentColor" d="M20 12a8 8 0 0 0-.2-1.7l1.9-1.6-2-3.4-2.4.8a8 8 0 0 0-2.8-1.7L14 2h-4l-.5 2.4c-1 .3-2 1-2.8 1.7l-2.4-.8-2 3.4 1.9 1.6a8 8 0 0 0 0 3.4l-1.9 1.6 2 3.4 2.4-.8a8 8 0 0 0 2.8 1.7L10 22h4l.5-2.4c1-.3 2-1 2.8-1.7l2.4.8 2-3.4-1.9-1.6.2-1.7zm-8 4a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg>';

export class TezosWidget extends HTMLElement {

  #renderIteration = 0;
  #propertyChanged = null;
  #dataChanged = {};
  #reducerHandler = null;
  #panelConfig = null;
  #clickHandler = null;
  #submitHandler = null;

  // initialize
  constructor() {

    super();

    this.renderDebounce = 50;
    this.styleDynamic = '';
    this.#defineProperties();

    // keyboard tab
    this.setAttribute('tabindex', 0);

    // state data - becomes a property
    this.constructor.observedReducers.forEach(p => {
      this[p] = observeReducer(p);
      this.#dataChanged[p] = { value: this[p] };
    });

    // create shadow DOM
    this.shadow = this.attachShadow({ mode: 'closed' });

  }


  // attribute/property change
  attributeChangedCallback(property, valueOld, value) {

    if (value == valueOld) return;

    console.log(`attributeChangedCallback: ${ property } changed from ${ valueOld } to ${ value }`);

    // append changed property data
    property = this.#camelCase(property);
    this.#propertyChanged = this.#propertyChanged || {};
    this.#propertyChanged[property] = this.#propertyChanged[property] || { valueOld };
    this.#propertyChanged[property].value = value;

    this.#renderDebounce();

  }


  // connect component to DOM
  connectedCallback() {

    // tezos reducer event
    this.#reducerHandler = this.#reducerChangedCallback.bind(this);
    tezosReducer.addEventListener('change', this.#reducerHandler);

    // click handler
    this.#clickHandler = this.#clickHandlerCallback.bind(this);
    this.shadow.addEventListener('click', this.#clickHandler);

    // form handler
    this.#submitHandler = this.#submitHandlerCallback.bind(this);
    this.shadow.addEventListener('submit', this.#submitHandler);

    // render
    this.#renderComponent();
  }


  // removed from DOM
  disconnectedCallback() {
    tezosReducer.removeEventListener('change', this.#reducerHandler);
    this.shadow.removeEventListener('click', this.#clickHandler);
    this.shadow.removeEventListener('submit', this.#submitHandler);
  }


  // state update
  #reducerChangedCallback(e) {

    console.log(`#reducerChangeCallback: ${ e.detail.property } changed from ${ e.detail.valueOld } to ${ e.detail.value }`);

    // observed state?
    const prop = e.detail.property;
    if ( !this.constructor.observedReducers.includes(prop) ) return;

    // append changed state data
    this[ prop ] = e.detail.value;
    this.#dataChanged = this.#dataChanged || {};
    this.#dataChanged[prop] = this.#dataChanged[prop] || { valueOld: e.detail.valueOld };
    this.#dataChanged[prop].value = e.detail.value;

    this.#renderDebounce();

  }


  // render debounce
  #renderTimer = null;
  #renderDebounce() {

    if (this.#renderIteration) {
      clearTimeout( this.#renderTimer );
      this.#renderTimer = setTimeout(() => this.#renderComponent(), this.renderDebounce);
    }

  }


  // pass updates and render HTML
  #renderComponent() {

    // fetch changed properties
    const propChange = this.#propertyChanged ? { ...this.#propertyChanged } : null;
    this.#propertyChanged = null;

    // fetch changed state
    const dataChange = this.#dataChanged ? { ...this.#dataChanged } : null;
    this.#dataChanged = null;

    // returns undefined (no action), or a DOM fragment or HTML string to render
    let rendered = this.render( this.#renderIteration, propChange, dataChange );

    if (typeof rendered !== 'undefined') {

      // clean shadow DOM
      util.dom.clean(this.shadow);

      // add styles
      const style = document.createElement('style');
      style.innerHTML = styleBase + this.constructor.styleBase + this.styleDynamic;
      util.dom.add( this.shadow, style );

      // configuration button
      if (this.constructor.observedAttributes.length) {
        util.dom.add( this.shadow, buttonConfig.cloneNode(true) );
      }

      // add content
      util.dom.add( this.shadow, rendered );

    }

    this.postRender( this.#renderIteration++, propChange, dataChange );

  }


  // rendering defaults
  render() {}
  postRender() {}


  // click event
  #clickHandlerCallback(e) {

    if (!e?.target?.closest('button')?.classList.contains('config')) return;

    // render configuration form
    const
      attr = this.constructor.attribute,
      sect = document.createElement('section'),
      form = sect.appendChild( document.createElement('form') ),
      grid = form.appendChild( document.createElement('div') );

    sect.className = 'configpanel';
    grid.className = 'formgrid';

    // add field
    for (const a in attr) {

      let field;

      switch (attr[a].type) {

        case 'select':
          field = document.createElement('select');
          attr[a].options.forEach(o => {
            const
              opt = field.appendChild( document.createElement('option')),
              val = (typeof o === 'object' ? o.value || '' : o);
            opt.textContent = o.label || o;
            opt.value = val;
            if (val == this[a]) opt.selected = true;
          });
          break;

        default:
          field = document.createElement('input');
          field.type = attr[a].type;
          field.checked = !!this[a];
          break;

      }

      field.id = a;
      grid.appendChild(field);

      // add label
      const label = grid.appendChild( document.createElement('label') );
      label.htmlFor = a;
      label.textContent = attr[a].label || a;

    }

    // submit button
    const
      bc = grid.appendChild( document.createElement('p') ),
      bs = bc.appendChild( document.createElement('button') );

    bs.type = 'submit';
    bs.textContent = 'apply';

    this.#panelConfig = util.dom.add( this.shadow, sect );

  }


  // configuration submit
  #submitHandlerCallback(e) {

    e.preventDefault();

    // assign form values to properties
    const field = e?.target?.elements;
    if (field && field.length) {

      Array.from(field).forEach(f => {

        if (f.id && this.hasOwnProperty(f.id)) {
          const type = this.constructor.attribute[f.id]?.type;
          this[f.id] = (type === 'checkbox' || type == 'radio' ? (f.checked ? '1' : '') : f.value);
        }

      });

    }

    if (this.#panelConfig) {
      this.shadow.removeChild( this.#panelConfig );
      this.#panelConfig = null;
      this.focus();
    }

  }


  // set/get attribute when property is used
  #defineProperties() {

    const attributes = new Set([...this.getAttributeNames(), ...this.constructor.observedAttributes]);

    attributes.forEach(attr => {

      Object.defineProperty(this, this.#camelCase(attr), {
        set: value => this.setAttribute( attr, value ),
        get: () => this.getAttribute( attr )
      });

    });

  }


  // convert camel-case attribute to camelCase property
  #attrToProp = {}; // camelCase cache
  #camelCase(attr) {

    let prop = this.#attrToProp[attr];

    if (!prop) {

      let np = attr.split('-');
      prop = [ np.shift(), ...np.map(n => n[0].toUpperCase() + n.slice(1)) ].join('');
      this.#attrToProp[attr] = prop;

    }

    return prop;

  }

}
