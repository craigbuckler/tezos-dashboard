// configuration panel
import { tezosReducer, util } from '../dashboard.js';

// dashboard options
const dashboard = {

  container:  document.querySelector('main'),
  addlist:    document.querySelector('#dashconfig-add'),
  widget: {

    'time': {
      name: 'date/time',
      icon: 'clock',
      html: '<tezos-time zone="UTC" colspan="2" rowspan="1"></tezos-time>',
      size: [
        [ 1, 1 ], [ 2, 2 ], [ 3, 2 ], [ 4, 2 ]
      ]
    }

  }
};

// initialize widget choice
for (const w in dashboard.widget) {

  util.dom.add(
    dashboard.addlist,
    `<li data-widget="${ w }" tabindex="0" class="icon ${ dashboard.widget[w].icon }">${ dashboard.widget[w].name }</li>`
  );

}

// initialize form fields
Array.from(document.querySelectorAll('[data-tezos-reducer]')).forEach(field => {

  const value = tezosReducer[field.dataset.tezosReducer];

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

  if (widget) util.dom.add(dashboard.container, widget.html);

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
