'use strict';

const _ = require('lodash');
const qs = require('querystring');
const Joi = require('joi');
const url = require('url');
const util = require('util');
const oauth = require('oauth');
const moment = require('moment');
const urljoin = require('url-join');
const constants = require('./lib/constants');

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

        this.marketClock(
            (err, data, response) => {
                this.clock = JSON.parse(data).response;
                const servertime = this.clock.unixtime;
                const localtime = moment().unix();
                this.clockSkew = localtime - servertime;
            }
        );
    }

    marketClock(callback) {
        return this.request(constants.ENDPOINTS.MARKET_CLOCK, callback);
    }

    accountSummary(callback) {
        return this.request(constants.ENDPOINTS.ACCOUNT_SUMMARY, callback);
    }

    accountBalances(callback) {
        return this.request(constants.ENDPOINTS.ACCOUNT_BALANCE, callback);
    }

    streamQuote(symbols, callback) {
        if(!_.isArray(symbols)) {
            throw TypeError("symbols is not an array");
        }

        var request = this.request(constants.ENDPOINTS.STREAM_QUOTE, symbols);

        request
            .on('response', response => {
                response
                    .setEncoding('utf8')
                    .on('data', data => {
                        callback(null, data);
                    })
                    .on('error', error => {
                        callback(error);
                    });
            })
            .on('error', error => {
                callback(error);
            })
            .end();

        return request;
    }


    // --- low-level requests ------------------------------------------

    request(endpoint, payload, callback) {
        if(!_.isArray(endpoint)) {
            throw TypeError("endpoint is not an array");
        } else if(_.isFunction(payload)) {
            callback = payload;
            payload = {};
        }

        var request;
        const [method, uri] = endpoint;

        switch (method.toLowerCase()) {
            case 'get':
                request =
                    this.oauth.get(
                        urljoin(constants.API_URL, uri),
                        this.config.accessToken,
                        this.config.accessSecret,
                        callback
                    );
                break;

            case 'post':
                throw Error("not implemented");
                // request =
                //     this.oauth.post(
                //         urljoin(constants.API_URL, uri),
                //         this.config.accessToken,
                //         this.config.accessSecret,
                //         payload,'text/plain', callback
                //     );
                break;

            case 'stream':
                const _url = urljoin(constants.STREAM_URL, uri);
                const _qs = qs.stringify({symbols: payload.toString()});
                request =
                    this.oauth.get(
                        url.parse(_url + '?' + _qs).href,
                        this.config.accessToken,
                        this.config.accessSecret
                    );
                break;

            default:
                throw TypeError("unknown request method");
        }

        return request;
    }
}

module.exports = Tradeking;
