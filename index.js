'use strict';

const _ = require('lodash');
const qs = require('querystring');
const oauth = require('oauth');
const moment = require('moment');
const urljoin = require('url-join');
const constants = require('./lib/constants');

const debug_http = require('debug')('tradeking:http');

class Tradeking {

    constructor(config) {
        this.config = config;

        this.oauth = new oauth.OAuth(
          config.requestUrl         || null,    // https://developers.tradeking.com/oauth/request_token
          config.accessUrl          || null,    // https://developers.tradeking.com/oauth/access_token
          config.consumerKey        || null,
          config.consumerSecret     || null,
          config.version            || '1.0',
          config.authorize_callback || null,
          config.signatureMethod    || 'HMAC-SHA1',
          config.nonceSize          || null,
          config.customHeaders      || null
        );

        this.marketClock()
            .then(clock => {
                const servertime = clock.unixtime;
                const localtime = moment().unix();
                this.clockSkew = localtime - servertime;
                this.clock = clock;
            });
    }

    marketClock() {
        const uri = constants.ENDPOINTS.MARKET_CLOCK;
        return this.request('get', uri);
    }

    accountSummary() {
        const uri = constants.ENDPOINTS.ACCOUNT_SUMMARIES;
        return this.request('get', uri);
    }

    accountBalances() {
        const uri = constants.ENDPOINTS.ACCOUNT_BALANCES;
        return this.request('get', uri);
    }

    async streamQuote(symbols, callback) {
        if(!_.isArray(symbols)) {
            throw new TypeError("symbols is not an array");
        }

        const uri = constants.ENDPOINTS.STREAM_QUOTE;
        return await
            this.request('stream', constants.ENDPOINTS.STREAM_QUOTE, symbols)
                .then(stream => {
                    stream
                        .on('response', response => {
                            response
                                .setEncoding('utf8')
                                .on('data', data => {
                                    callback(null, JSON.parse(data));
                                })
                                .on('error', error => {
                                    callback(new Error(error));
                                });
                        })
                        .on('error', error => {
                            callback(new Error(error));
                        })
                        .end();
                });
    }

    // --- low-level requests ------------------------------------------

    request(method, uri, content_type, payload) {

        return new Promise((resolve, reject) => {

            const handler = (error, data, response) => {
                debug_http(response);
                if (error) {
                    reject(error);
                } else if (data) {
                    resolve(JSON.parse(data).response);
                } else {
                    reject(new Error("fatal: unknown error"));
                }
            };

            switch (method.toLowerCase()) {
                case 'get':
                    this.oauth.get(
                        urljoin(constants.API_URL, uri),
                        this.config.accessToken,
                        this.config.accessSecret,
                        handler
                    );
                    break;

                case 'post':
                    this.oauth.post(
                        urljoin(constants.API_URL, uri),
                        this.config.accessToken,
                        this.config.accessSecret,
                        payload,'text/plain', handler
                    );
                    break;

                case 'stream':
                    const _qs = qs.stringify({ symbols: symbols.join(',') });
                    resolve(this.oauth.get(
                        urljoin(constants.STREAM_URL, uri + '?' + _qs),
                        this.config.accessToken,
                        this.config.accessSecret
                    ));
                    break;

                default:
                    reject(new TypeError("unknown request method"));
                    break;
            }
        });
    }

}

module.exports = Tradeking;
