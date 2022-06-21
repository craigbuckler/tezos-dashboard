/*
Tezos Widget class
All widgets must extend from this class
*/

/*
Notes:
* this.constructor.name - the inheriting class name
* this.constructor.observedReducers - static value
*/

// state
import tezosReducer, { observeReducer } from './tezos-reducer.js';
import * as util from './tezos-util.js';

export class TezosWidget extends HTMLElement {

  #renderIteration = 0;
  #propertyChanged = null;
  #dataChanged = {};
  #reducerHandler = null;

  // initialize
  constructor() {

    super();

    this.#defineProperties();
    this.renderDebounce = 50;

    // tezos reducer event
    this.#reducerHandler = this.#reducerChangedCallback.bind(this);
    tezosReducer.addEventListener('change', this.#reducerHandler);

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


  // connect component to DOM
  connectedCallback() {
    this.#renderComponent();
  }


  // removed from DOM
  disconnectedCallback() {
    tezosReducer.removeEventListener('change', this.#reducerHandler);
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

      // convert string to DOM elements
      if (typeof rendered === 'string') {

        const
          div = document.createElement('div'),
          frag = new DocumentFragment();

        div.innerHTML = util.string.minify( rendered );
        while (div.childElementCount) {
          frag.appendChild(div.firstElementChild);
        }

        rendered = frag;

      }

      // append to shadow DOM
      while (this.shadow.lastChild) this.shadow.removeChild(this.shadow.lastChild);
      this.shadow.appendChild( rendered );

    }

    this.postRender( this.#renderIteration++, propChange, dataChange );

  }


  // rendering defaults
  render() {}
  postRender() {}


  // set/get attribute when property is used
  #defineProperties() {

    this.getAttributeNames().forEach(attr => {

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
