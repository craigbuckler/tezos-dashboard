// Browser-sync configuration
// http://www.browsersync.io/docs/options/
module.exports = {
  'ui': {
    'port': 3001
  },
  'files': ['static/**/*'],
  'watchEvents': [
    'change'
  ],
  'watch': false,
  'ignore': [],
  'single': false,
  'watchOptions': {
    'ignoreInitial': true
  },
  'server': {
    'baseDir': 'static',
    'index': 'index.html'
  },
  'proxy': false,
  'port': 3000,
  'middleware': false,
  'serveStatic': [],
  'ghostMode': {
    'clicks': true,
    'scroll': true,
    'location': true,
    'forms': {
      'submit': true,
      'inputs': true,
      'toggles': true
    }
  },
  'logLevel': 'info',
  'logPrefix': 'Browsersync',
  'logConnections': false,
  'logFileChanges': true,
  'logSnippet': false,
  'rewriteRules': [],
  'open': false,
  'browser': 'default',
  'cors': false,
  'xip': false,
  'hostnameSuffix': false,
  'reloadOnRestart': true,
  'notify': false,
  'scrollProportionally': true,
  'scrollThrottle': 200,
  'scrollRestoreTechnique': 'window.name',
  'scrollElements': [],
  'scrollElementMapping': [],
  'reloadDelay': 0,
  'reloadDebounce': 500,
  'reloadThrottle': 0,
  'plugins': [],
  'injectChanges': true,
  'startPath': null,
  'minify': true,
  'host': null,
  'localOnly': false,
  'codeSync': true,
  'timestamps': true,
  'clientEvents': [
    'scroll',
    'scroll:element',
    'input:text',
    'input:toggles',
    'form:submit',
    'form:reset',
    'click'
  ],
  'socket': {
    'socketIoOptions': {
      'log': false
    },
    'socketIoClientConfig': {
      'reconnectionAttempts': 50
    },
    'path': '/browser-sync/socket.io',
    'clientPath': '/browser-sync',
    'namespace': '/browser-sync',
    'clients': {
      'heartbeatTimeout': 5000
    }
  }
};
