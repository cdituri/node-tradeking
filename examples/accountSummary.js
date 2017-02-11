const config = require('./config');
const Tradeking = require('../index');
const tk = new Tradeking(config);

tk.accountSummary(
    (error, data, response) => {
        if (error) {
            console.error(error);
        } else {
            console.log(JSON.stringify(JSON.parse(data), null, 4));
        }
    }
);
