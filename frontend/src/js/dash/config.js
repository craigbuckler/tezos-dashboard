// configuration panel
import { stateZ, tezosReducer, util } from '../dashboard.js';

// dashboard options
const
  dashboard = {

    state:      stateZ({ name: 'dashState' }),
    container:  document.querySelector('main'),
    addlist:    document.querySelector('#dashconfig-add'),
    control:    document.querySelector('#dashcontrol'),
    tooltip:    document.querySelector('#dashconfig-tooltip'),
    widget: {

      'time': {
        name: 'date/time',
        icon: 'clock',
        html: '<tezos-time zone="UTC"></tezos-time>',
        size: [
          [ 2, 1 ], [ 2, 2 ], [ 3, 2 ], [ 4, 2 ]
        ]
      },

      'liveprice': {
        name: 'live price',
        icon: 'value',
        html: '<tezos-liveprice crypto="XTZ" currency="USD" increase="1"></tezos-liveprice>',
        size: [
          [ 2, 1 ], [ 2, 2 ], [ 3, 2 ], [ 4, 2 ]
        ]
      },

      'accounts': {
        name: 'Tezos accounts',
        icon: 'account',
        html: '<tezos-accounts></tezos-liveprice>',
        size: [
          [ 4, 3 ], [ 6, 3 ], [8, 3]
        ]
      },

      'cycle': {
        name: 'Tezos cycle',
        icon: 'bake',
        html: '<tezos-cycle></tezos-cycle>',
        size: [
          [ 4, 3 ], [ 6, 3 ], [8, 3]
        ]
      }

    }
  };


// initialize dashboard
util.dom.clean( dashboard.container );
util.dom.add( dashboard.container, dashboard.state.widgets || '' );
showTooltip();


// initialize widget choice
for (const w in dashboard.widget) {

  util.dom.add(
    dashboard.addlist,
    `<li data-widget="${ w }" tabindex="0" class="icon ${ dashboard.widget[w].icon }">${ dashboard.widget[w].name }</li>`
  );

}

// initialize form fields
Array.from(document.querySelectorAll('[data-tezos-reducer]')).forEach(field => {

  const value = tezosReducer[field.dataset.tezosReducer] || '';

  switch (field.type) {

    case 'checkbox':
      field.checked = !!value;
      break;

    case 'radio': {
      field.checked = (field.value === value);
      break;
    }

    default:
      field.value = value;
      break;

  }

});


// add widget
dashboard.addlist.addEventListener('click', e => {

  const
    wName = e?.target?.dataset?.widget,
    widget = wName && dashboard.widget[wName];

  if (widget) {

    const w = util.dom.add(dashboard.container, widget.html);

    // set type
    w.dataset.dashName = wName;

    // set size
    w.dataset.dashSize = 0;
    w.setAttribute('colspan', widget.size[0][0]);
    w.setAttribute('rowspan', widget.size[0][1]);

    // hide tooltip
    showTooltip();

  }

});


// update tezosReducer.prop value from field where data-tezos-reducer=[prop]
document.body.addEventListener('change', e => {

  const
    field = e?.target,
    reducer = field?.dataset?.tezosReducer;

  if (reducer) {

    tezosReducer[reducer] = (
      field.type === 'password' ||
      (field.type === 'checkbox' && !field.checked) ?
        '' :
        field.value
    );

  }

});


// show/hide start tooltip
function showTooltip() {
  if (dashboard.container.childElementCount) {
    dashboard.tooltip.classList.remove('enable');
  }
  else {
    dashboard.tooltip.classList.add('enable');
  }
}


// widget has focus
let wFocus;
dashboard.container.addEventListener('focusin', e => {
  wFocus = e.target;
  dashboard.control.classList.add('focus');
});


// no focus
dashboard.container.addEventListener('focusout', () => {
  dashboard.control.classList.remove('focus');
});


// control button handler
dashboard.control.addEventListener('click', e => {

  if (!wFocus) return;

  const action = e?.target?.closest('button')?.id;
  if (action && actionHandler[action]) actionHandler[action]();
  if (wFocus) wFocus.focus();

});


// control button actions
const actionHandler = {

  'dashmoveup': () => {
    if (wFocus.previousSibling) {
      wFocus = wFocus.previousSibling.insertAdjacentElement('beforebegin', wFocus);
    }
  },

  'dashmovedown': () => {
    if (wFocus.nextSibling) {
      wFocus = wFocus.nextSibling.insertAdjacentElement('afterend', wFocus);
    }
  },

  'dashresize': () => {
    const w = dashboard.widget[ wFocus.dataset.dashName ];
    wFocus.dataset.dashSize = ++wFocus.dataset.dashSize % w.size.length;
    wFocus.setAttribute('colspan', w.size[wFocus.dataset.dashSize][0]);
    wFocus.setAttribute('rowspan', w.size[wFocus.dataset.dashSize][1]);
  },

  'dashdelete': () => {
    wFocus = wFocus.remove();
    showTooltip();
  }

};


// save dashboard state after DOM mutation (debounced for 5 seconds)
const observer = new MutationObserver( util.debounce( () => {

  dashboard.state.widgets = dashboard.container.innerHTML;

}, 5000) );
observer.observe(dashboard.container, { attributes: true, childList: true, subtree: true });
