'use strict';

var fids = require('./fids');
var toplists = require('./toplists');

module.exports = {
    API_URL: 'https://api.tradeking.com/v1',
    STREAM_URL: 'https://stream.tradeking.com/v1',
    ENDPOINTS: {
        MARKET_CLOCK:    ['get', '/market/clock.json'],
        ACCOUNT_SUMMARY: ['get', '/accounts.json'],
        ACCOUNT_BALANCE: ['get', '/accounts/balances.json'],
        STREAM_QUOTE:    ['stream', '/market/quotes.json']
    },
    FIDS: fids
}
