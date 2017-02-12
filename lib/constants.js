'use strict';

var fids = require('./fids');
var toplists = require('./toplists');

module.exports = {
    API_URL: 'https://api.tradeking.com/v1',
    STREAM_URL: 'https://stream.tradeking.com/v1',
    ENDPOINTS: {
        MARKET_CLOCK:      '/market/clock.json',
        ACCOUNT_SUMMARY:   '/accounts/:id.json',
        ACCOUNT_SUMMARIES: '/accounts.json',
        ACCOUNT_BALANCE:   '/accounts/:id/balances.json',
        ACCOUNT_BALANCES:  '/accounts/balances.json',
        STREAM_QUOTE:      '/market/quotes.json'
    },
    FIDS: fids
}
