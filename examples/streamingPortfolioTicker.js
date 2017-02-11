'use strict';
const _ = require('lodash');
const config = require('./config');
const Tradeking = require('../index');
const tk = new Tradeking(config);

tk.accountSummary(
    (error, data) => {
        if (error) throw Error(error);

        const response = JSON.parse(data).response;
        const holdings = response.accounts.accountsummary.accountholdings.holding;
        const symbols = _.map(holdings, holding => holding.instrument.sym);

        console.log(`watching ${_.trimEnd(symbols.join(','), ',')}`);

        const stream =
            tk.streamQuote(symbols,
                (error, data) => {
                    if (error) {
                        console.error(error);
                    } else {
                        const obj = JSON.parse(data);
                        console.log(JSON.stringify(obj, null, 4));
                    }
                }
            );

        setTimeout(c => c.abort(), (30 * 1000), stream);
    }
);
