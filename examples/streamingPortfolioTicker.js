var oauth = require('oauth');
var debug = require('debug')('app');
var config = require('./config');
var Tradeking = require('../src/tradeking');
var tk = new Tradeking(config);

var consumer = new oauth.OAuth(null, null, config.consumerKey, config.consumerSecret, "1.0", null, "HMAC-SHA1");

tk.once('ready', function() {
  tk.getAccountsAsync()
    .get(0)
   .then(function(data) {
      var response = JSON.parse(data).response;
      return response.accounts.accountsummary.accountholdings.holding
    })
    .map(function(holding) {
      return holding.instrument.sym
    })
    .then(function(symbols) {
      var request = consumer.get(
        "https://stream.tradeking.com/v1/market/quotes.json?symbols=" + symbols.toString(),
        config.accessToken,
        config.accessSecret
      );

      debug("Watching the following symbols: %s", symbols.toString());

      request.on('response', function(response) {
        response.setEncoding('utf8');
        response.on('data', function(data) { console.log(data) });
        response.on('error', function(error) { console.log(error) });
      });
      request.end();
    })
    .catch(function(error) {
      console.log(error);
    });
});
