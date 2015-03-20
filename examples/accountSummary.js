var config = require('./config');
var Tradeking = require('../src/tradeking');
var tk = new Tradeking(config);

tk.once('ready', function() {
  tk.getAccountsAsync()
    .get(0)
    .then(function(data) {
      var response = JSON.parse(data).response;
      return response.accounts.accountsummary;
    })
    .then(function(summary) {
      console.log(JSON.stringify(summary, null, 4));
    })
    .catch(function(error) {
      console.log(error);
    });
});
