// configuration panel
import { stateZ, tezosReducer, util } from '../dashboard.js';

// dashboard options
const
  dashboard = {

    state:        stateZ({ name: 'dashState' }),
    dom:          new util.DOM(),
    container:    document.querySelector('main'),
    addlist:      document.querySelector('#dashconfig-add'),
    control:      document.querySelector('#dashcontrol'),
    tooltip:      document.querySelector('#dashconfig-tooltip'),
    fullscreen:   document.getElementById('fullscreen'),
    fsElement:    document.documentElement,
    awakeEnabled: false,
    awake:        document.getElementById('awake'),
    wakeLock:     null,
    pwaSW:        'serviceWorker' in navigator && '/sw.js?v__meta_version__',
    install:      document.getElementById('install'),
    widget: {

      'time': {
        name: 'date/time',
        icon: 'clock',
        html: '<tezos-time zone="UTC"></tezos-time>',
        size: [
          [ 2, 1 ], [ 3, 1 ], [ 4, 1 ]
        ]
      },

      'liveprice': {
        name: 'current price',
        icon: 'value',
        html: '<tezos-liveprice crypto="XTZ" currency="USD" increase="1"></tezos-liveprice>',
        size: [
          [ 2, 1 ], [ 3, 1 ], [ 4, 1 ]
        ]
      },

      'daychart': {
        name: 'day chart',
        icon: 'chart',
        html: '<tezos-daychart crypto="XTZ" currency="USD" zone="UTC"></tezos-daychart>',
        size: [
          [ 3, 2 ], [ 4, 2 ], [6, 2]
        ]
      },

      'monthchart': {
        name: 'month chart',
        icon: 'chart',
        html: '<tezos-monthchart crypto="XTZ" currency="USD" zone="UTC"></tezos-monthchart>',
        size: [
          [ 3, 2 ], [ 4, 2 ], [6, 2]
        ]
      },

      'cryptocompare': {
        name: 'month compare',
        icon: 'chart',
        html: '<tezos-cryptomonth zone="UTC"></tezos-cryptomonth>',
        size: [
          [ 3, 2 ], [ 4, 2 ], [6, 2]
        ]
      },

      'accounts': {
        name: 'XTZ accounts',
        icon: 'account',
        html: '<tezos-accounts></tezos-accounts>',
        size: [
          [ 4, 2 ], [ 6, 2 ]
        ]
      },

      'accounts30': {
        name: 'XTZ month',
        icon: 'account',
        html: '<tezos-accounts30></tezos-accounts30>',
        size: [
          [ 3, 2 ], [ 4, 2 ]
        ]
      },

      'cycle': {
        name: 'XTZ cycle',
        icon: 'bake',
        html: '<tezos-cycle></tezos-cycle>',
        size: [
          [ 4, 2 ], [ 6, 2 ]
        ]
      },

      'blocksolve': {
        name: 'XTZ block solve',
        icon: 'bake',
        html: '<tezos-blocksolve></tezos-blocksolve>',
        size: [
          [ 3, 2 ], [ 4, 2 ]
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
    `<li data-widget="${ w }" tabindex="0" class="icon ${ dashboard.widget[w].icon }" data-lang="${ dashboard.widget[w].name }"></li>`
  );

}


// choice updates
tezosReducer.addEventListener('change', e => {
  if (e.detail.property === 'locale') localizeDashboard();
  if (e.detail.property === 'awake') wakeLock();
});

localizeDashboard();

// localize all dashboard strings
function localizeDashboard() {

  Array.from(document.querySelectorAll('[data-lang]')).forEach(n => {
    n.textContent = localizeString(n.dataset.lang);
  });

}


// localize a string
function localizeString(str) {

  str.split(/\W/).forEach(w => {
    const trans = util.lang(w);
    if (trans !== w) {
      str = str.replace(new RegExp(w, 'ig'), trans);
    }
  });

  return str;

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


// full screen option
if (dashboard.fsElement.requestFullscreen && document.exitFullscreen) {

  // icon activated
  dashboard.fullscreen.addEventListener('click', fullscreenToggle);
  dashboard.fullscreen.addEventListener('keydown', e => {
    const c = e.code;
    if (c == 'Enter' || c == 'Space') fullscreenToggle();
  });

  // enable icon
  dashboard.fullscreen.removeAttribute('hidden');

}


// toggle fullscreen
function fullscreenToggle() {

  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
  else {
    dashboard.fsElement.requestFullscreen();
  }

}


// wake locking
if ('wakeLock' in navigator) {

  dashboard.awakeEnabled = true;

  // full screen and visibility change event
  document.addEventListener('fullscreenchange', wakeLock);
  document.addEventListener('visibilitychange', wakeLock);
  await wakeLock();

  // enable option
  Array.from( document.querySelectorAll(`label[for="${ dashboard.awake.id }"]`) ).forEach(n => n.removeAttribute('hidden'));
  dashboard.awake.removeAttribute('hidden');

}

async function wakeLock() {

  if (!dashboard.awakeEnabled) return;

  try {

    const awake = tezosReducer.awake;

    if (
      document.visibilityState === 'visible' &&
      (awake == 'y' || (awake == 'f' && document.fullscreenElement))
    ) {

      // enable wakelock
      dashboard.wakeLock = dashboard.wakeLock || await navigator.wakeLock.request('screen');

    }
    else {

      // disable wakelock
      if (dashboard.wakeLock) {
        await dashboard.wakeLock.release();
        dashboard.wakeLock = null;
      }

    }

  }
  catch(e) {}

}


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


// save dashboard state after DOM mutation (debounced for 1 second)
const observer = new MutationObserver( util.debounce( () => {

  dashboard.state.widgets = dashboard.container.innerHTML;

}, 1000) );
observer.observe(dashboard.container, { attributes: true, childList: true, subtree: true });


// PWA installation
let deferredPrompt;

if (dashboard.pwaSW && dashboard.install) {

  // register service worker
  navigator.serviceWorker.register(dashboard.pwaSW);

  // install prompt
  window.addEventListener('beforeinstallprompt', e => {

    e.preventDefault();
    deferredPrompt = e;
    dashboard.install.addEventListener('click', pwaInstall);
    dashboard.install.removeAttribute('hidden');

  });

}


// install PWA
function pwaInstall(e) {

  e.preventDefault();
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  deferredPrompt.userChoice
    .then(function(choice) {
      if (choice.outcome === 'accepted') {

        console.log('PWA installed');
        dashboard.install.setAttribute('hidden', '');
        dashboard.install.removeEventListener('click', pwaInstall);

      }
      deferredPrompt = null;
    });

}
