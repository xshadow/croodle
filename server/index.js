// To use it create some files under `routes/`
// e.g. `server/routes/ember-hamsters.js`
//
// module.exports = function(app) {
//   app.get('/ember-hamsters', function(req, res) {
//     res.send('hello');
//   });
// };

module.exports = function(app) {
  var bodyParser = require('body-parser');
  var globSync   = require('glob').sync;
  var mocks      = globSync('./mocks/**/*.js', { cwd: __dirname }).map(require);
  var proxies    = globSync('./proxies/**/*.js', { cwd: __dirname }).map(require);

  /* use node-phpcgi to handle api */
  var phpcgi = require('node-phpcgi')({
    documentRoot: __dirname.substring(0, __dirname.length - 6) + '/dist',
    handler: '/usr/bin/php-cgi'
  });
  app.use(phpcgi);

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  mocks.forEach(function(route) { route(app); });

  // proxy expects a stream, but express will have turned
  // the request stream into an object because bodyParser
  // has run. We have to convert it back to stream:
  // https://github.com/nodejitsu/node-http-proxy/issues/180
  app.use(require('connect-restreamer')());
  proxies.forEach(function(route) { route(app); });
};
