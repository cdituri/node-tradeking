var oauth = require('oauth');
var querystring = require('querystring');
var path = require('path');
var debug = require('debug')('tradeking');
var util = require('util');
var EE = require('events').EventEmitter;

var Promise = require('bluebird').Promise;

module.exports = Tradeking; 

function Tradeking(config) {
  EE.call(this);

  if (!config)
    throw new Error("OAuth 1.0a config not supplied");

  var consumer = new oauth.OAuth(
    config.requestUrl         || null,    // https://developers.tradeking.com/oauth/request_token
    config.accessUrl          || null,     // https://developers.tradeking.com/oauth/access_token
    config.consumerKey        || null,
    config.consumerSecret     || null,
    config.version            || "1.0",
    config.authorize_callback || null,
    config.signatureMethod    || "HMAC-SHA1",
    config.nonceSize          || null,
    config.customHeaders      || null
  );

  var self = this;
  self._config = config;
  self._consumer = consumer;

  Promise.promisifyAll(self);

  self.getMarketClockAsync()
      .get(0)
      .then(function(clockData) {

        /* TODO: ditch this manual timestamp crap and use moment.js */
        var serverTimestamp = parseInt(JSON.parse(clockData).response.unixtime);
        var unixtimeNow = Math.floor( (new Date()).getTime() / 1000 );
        var offset = unixtimeNow - serverTimestamp;

        self._consumer._getTimestamp = function() {
          var unixtime = Math.floor( (new Date()).getTime() / 1000 );

          debug("now: %s, serverTimestamp: %s, timeOffset: %s, curtime: %s, adjTime: %s", 
                unixtimeNow, serverTimestamp, offset, unixtime, unixtime - offset);

          return unixtime - offset;
        }

        self.emit('ready');
      })
      .catch(function(error) {
        throw new Error("Fatal: could not synchronize local clock to Tradeking Market Clock");
      });
}
util.inherits(Tradeking, EE);

/* --- Order/Trade Calls ------------------------------------------------- */

// Tradeking.prototype.postAccountOrderPreview = function (accountId, fixml, cb) {
//   var uri = path.join('accounts/', accountId, '/orders/preview.json');
//   return this.post(uri, fixml, cb);
// }

/* --- Market Calls ------------------------------------------------- */

Tradeking.prototype.getMarketClock = function (cb) {
  return this.get('/market/clock.json', cb);
}

Tradeking.prototype.getMarketNewsSearch = function (searchOpts, cb) {
  // TODO: validate searchOpts against verbs permitted by TK API
  var uri = '/market/news/search.json?' + querystring.stringify(searchOpts);
  debug("getMarketNewsSearch() - uri: %s", uri);
  return this.get(uri, cb);
}

Tradeking.prototype.getMarketNewsStory = function (id, cb) {
  // TODO: validate id against the format expected by TK API
  var uri = path.join('/market/news/', id + '.json')
  debug("getMarketNewsSearch() - uri: %s", uri);
  return this.get(uri, cb);
}

Tradeking.prototype.getMarketToplists = function (toplist, cb) {
  var validToplists = ["toplosers", "toppctlosers", "topvolume",
                       "topactive", "topgainers", "toppctgainers",
                       "topactivegainersbydollarvalue"];

  if (0 > validToplists.indexOf(toplist))
    throw TypeError("'" + toplist + "' not found in: " + validToplists.toString());

  var uri = path.join('/market/toplists/', toplist + '.json');
  debug("getMarketToplists() - uri: %s", uri);
  return this.get(uri, cb);
}

/* --- Account Calls ------------------------------------------------- */

Tradeking.prototype.getAccounts = function (cb) {
  return this.get('/accounts.json', cb);
}

Tradeking.prototype.getAccountBalances = function (cb) {
  return this.get('/accounts/balances.json', cb);
}

/* --- Low-level Calls ------------------------------------------------- */

Tradeking.prototype.get = function (uri, cb) {
  return this._consumer.get(  
           this._config.apiUrl + uri,
           this._config.accessToken,
           this._config.accessSecret,
           cb
         );
}

Tradeking.prototype.post = function (uri, fixmlData, cb) {
  return this._consumer.post(  
           this._config.apiUrl + uri,
           this._config.accessToken,
           this._config.accessSecret,
           fixmlData, 'text/xml', cb
         );
}

