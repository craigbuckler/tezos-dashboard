/*
Tezos Widget class
All widgets must extend from this class
*/

// state
import tezosReducer, { observeReducers } from './tezos-reducer.js';
import * as util from './tezos-util.js';

// widget base styles
import styleBase from './css/tezos-widget-base.css';

// configuration button
import buttonCogIcon from '../../media/icons/cog.svg';
const buttonConfig = document.createElement('button');
buttonConfig.classList.add('config');
buttonConfig.innerHTML = buttonCogIcon;

export class TezosWidget extends HTMLElement {

  #renderIteration = 0;
  #propertyChanged = null;
  #dataChanged = {};
  #buttonConfig = null;
  #panelConfig = null;
  #renderHandler = () => {};
  #reducerHandler = null;
  #clickHandler = null;
  #changeHandler = null;
  #submitHandler = null;

  // initialize
  constructor() {

    super();

    this.liveConfigUpdate = true; // update configuration properties when field changes
    this.renderDebounce = 100;    // delay before rendering when properties or data update
    this.styleDynamic = '';       // styles applied at render time

    this.#defineProperties();

    // keyboard tab
    this.setAttribute('tabindex', 0);

    // create shadow DOM
    this.shadow = this.attachShadow({ mode: 'closed' });

  }


  // connect component to DOM
  async connectedCallback() {

    // set state data as properties
    const reducer = await observeReducers( this.constructor.observedReducers );
    this.#dataChanged = {};
    for (let p in reducer) {
      this[ p ] = reducer[p];
      this.#dataChanged[p] = { value: this[p] };
    }

    // render debounce handler
    this.#renderHandler = util.debounce(this.#renderComponent, this.renderDebounce);

    // tezos reducer event
    this.#reducerHandler = this.#reducerChangedCallback.bind(this);
    tezosReducer.addEventListener('change', this.#reducerHandler);

    // click handler
    this.#clickHandler = this.#clickHandlerCallback.bind(this);
    this.shadow.addEventListener('click', this.#clickHandler);

    // change handler
    this.#changeHandler = this.#changeHandlerCallback.bind(this);
    this.shadow.addEventListener('change', this.#changeHandler);

    // form submit handler
    this.#submitHandler = this.#submitHandlerCallback.bind(this);
    this.shadow.addEventListener('submit', this.#submitHandler);
    this.shadow.addEventListener('keydown', this.#submitHandler);

    // render
    await this.preRender();
    this.#renderComponent();
  }


  // removed from DOM
  disconnectedCallback() {
    tezosReducer.removeEventListener('change', this.#reducerHandler);
    this.shadow.removeEventListener('click', this.#clickHandler);
    this.shadow.removeEventListener('change', this.#changeHandler);
    this.shadow.removeEventListener('submit', this.#submitHandler);
    this.shadow.removeEventListener('keydown', this.#submitHandler);
  }


  // attribute/property change
  attributeChangedCallback(property, valueOld, value) {

    if (value == valueOld) return;

    // console.log(`attributeChangedCallback: ${ property } changed from ${ valueOld } to ${ value }`);

    // append changed property data
    property = this.#camelCase(property);
    this.#propertyChanged = this.#propertyChanged || {};
    this.#propertyChanged[property] = this.#propertyChanged[property] || { valueOld };
    this.#propertyChanged[property].value = value;

    // debounced re-render
    this.#renderHandler();

  }


  // state update
  #reducerChangedCallback(e) {

    // console.log(`#reducerChangeCallback: ${ e.detail.property } changed from ${ e.detail.valueOld } to ${ e.detail.value }`);

    // observed state?
    const prop = e.detail.property;
    if ( !this.constructor.observedReducers.includes(prop) ) return;

    // append changed state data
    this[ prop ] = e.detail.value;
    this.#dataChanged = this.#dataChanged || {};
    this.#dataChanged[prop] = this.#dataChanged[prop] || { valueOld: e.detail.valueOld };
    this.#dataChanged[prop].value = e.detail.value;

    // debounced re-render
    this.#renderHandler();

  }


  // pass updates and render HTML
  #renderComponent() {

    // fetch changed properties
    const propChange = this.#propertyChanged ? { ...this.#propertyChanged } : null;
    this.#propertyChanged = null;

    // fetch changed state
    const dataChange = this.#dataChanged ? { ...this.#dataChanged } : null;
    this.#dataChanged = null;

    // can return undefined (no action), a DOM fragment or HTML string for rendering
    let rendered = this.render( this.#renderIteration, propChange, dataChange );

    if (typeof rendered !== 'undefined') {

      // clean shadow DOM
      util.dom.clean(this.shadow);
      this.#buttonConfig = null;

      // add styles
      const style = document.createElement('style');
      style.innerHTML = styleBase + this.constructor.styleBase + this.styleDynamic;
      util.dom.add( this.shadow, style );

      // add content
      util.dom.add( this.shadow, rendered );

    }

    // show/hide configuration button
    if (this.constructor.observedAttributes.length) {

      if (this.noconfig) {
        if (this.#buttonConfig) {
          this.#buttonConfig = this.#buttonConfig.remove();
        }
      }
      else {
        if (!this.#buttonConfig) {
          this.#buttonConfig = util.dom.add( this.shadow, buttonConfig.cloneNode(true) );
        }
      }

    }

    this.postRender( this.#renderIteration++, propChange, dataChange );

    // set tabindex on child nodes (necessary for iOS)
    Array.from(this.shadow.children).forEach(c => {
      c.setAttribute('tabindex', '0');
    });

  }


  // render configuration form
  #renderConfig() {

    const
      attr = this.constructor.attribute,
      sect = document.createElement('section'),
      form = sect.appendChild( document.createElement('form') ),
      grid = form.appendChild( document.createElement('div') );

    sect.className = 'configpanel';
    grid.className = 'formgrid';

    let firstField;

    // add field
    for (const a in attr) {

      let field;

      switch (attr[a].type) {

        case 'select':
          field = document.createElement('select');

          if (attr[a]?.options?.length) {

            attr[a].options.forEach(o => {
              const
                opt = field.appendChild( document.createElement('option')),
                val = (typeof o === 'object' ? o.value || '' : o);
              opt.textContent = util.lang( o.label || o );
              opt.value = val;
              if (val == this[a]) opt.selected = true;
            });

          }
          break;

        default:
          field = document.createElement('input');
          field.type = attr[a].type;

          if (field.type == 'checkbox') {
            field.checked = !!this[a];
          }
          else {
            field.required = true;
            field.value = this[a] || attr[a].value;
            if (attr[a].min) field.min = attr[a].min;
            if (attr[a].max) field.max = attr[a].max;
          }
          break;

      }

      field.id = a;
      firstField = firstField || field;
      grid.appendChild(field);

      // add label
      const label = grid.appendChild( document.createElement('label') );
      label.htmlFor = a;
      label.textContent = util.lang( attr[a].label || a );

    }

    // submit button
    const
      bc = grid.appendChild( document.createElement('p') ),
      bs = bc.appendChild( document.createElement('button') );

    bs.type = 'submit';
    bs.textContent = 'OK';

    // append to DOM
    this.#panelConfig = util.dom.add( this.shadow, sect );
    firstField.focus();

  }


  // rendering defaults
  async preRender() {}
  render() {}
  postRender() {}


  // click event
  #clickHandlerCallback(e) {

    const button = e?.target?.closest('button');
    if (!button) return;

    // show configuration
    if (button.classList.contains('config')) this.#renderConfig();

  }


  // live configuration update
  #changeHandlerCallback(e) {

    if (this.liveConfigUpdate) {
      this.#fieldToProperty(e?.target);
    }

  }


  // configuration submit
  #submitHandlerCallback(e) {

    // cancel on Escape or Enter
    if (e.type === 'keydown' && e.code !== 'Escape') return;

    e.preventDefault();

    // update all properties from form fields
    const field = e?.target?.elements;
    if (field && field.length) {
      Array.from(field).forEach(f => this.#fieldToProperty(f));
    }

    // remove panel
    if (this.#panelConfig) {
      this.shadow.removeChild( this.#panelConfig );
      this.#panelConfig = null;
      this.focus();
    }

  }


  // assign form values to properties
  #fieldToProperty(field) {

    if (field && field.id && this.hasOwnProperty(field.id) && (!field.willValidate || field.validity.valid)) {
      const type = this.constructor.attribute[field.id]?.type;
      this[field.id] = (type === 'checkbox' || type == 'radio' ? (field.checked ? '1' : '') : field.value);
    }

  }


  // set/get attribute when property is used
  #defineProperties() {

    const attributes = new Set([...this.getAttributeNames(), ...this.constructor.observedAttributes]);

    attributes.forEach(attr => {

      Object.defineProperty(this, this.#camelCase(attr), {
        set: value => { this.setAttribute( attr, value ); },
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
