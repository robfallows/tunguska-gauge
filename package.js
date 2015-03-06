Package.describe({
  name: 'tunguska:gauge',
  version: '1.0.3',
  summary: 'Highly configurable, reactive gauges',
  git: 'https://github.com/robfallows/tunguska-gauge.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.3.1');
  api.addFiles('tunguska:gauge.js');
  api.export('TunguskaGauge','client');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('tunguska:gauge');
  api.addFiles('tunguska:gauge-tests.js');
});
