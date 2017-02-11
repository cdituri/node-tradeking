node-tradeking
==============

## About

### Build Status
[![Build Status](https://travis-ci.org/cdituri/node-tradeking.svg?branch=master)](https://travis-ci.org/cdituri/node-tradeking)

[![Build Status](https://app.codeship.com/projects/4d7025b0-d250-0134-d185-1ef44b0bbae3/status?branch=master)](https://app.codeship.com/projects/201760)

### Description
A node module for interfacing with the TradeKing REST API.

### Disclaimer
Alpha at best and in flux.

## Contributing
Pull requests and issues are encouraged!

### Author
Chris Dituri - csdituri@gmail.com

## Getting Started

### Installation
`npm install --production --save node-tradeking`

### Examples
See the [examples](https://github.com/cdituri/node-tradeking/tree/master/examples) directory for some ideas.
You'll need to adjust [examples/config.json](https://github.com/cdituri/node-tradeking/blob/master/examples/config.json) with your relevant OAuth information:

```bash
node ./examples/accountSummary.js
node ./examples/streamingPortfolioTicker.js
```

#### Instantiate
Instantiate a new Tradeking object.

```javascript
const config = require('./config')
const Tradeking = require('tradeking');
const tk = new Tradeking(config);
```

#### Account Summary

```javascript
tk.accountSummary((error, data) => console.log(data));
```

#### Account Balances

```javascript
tk.accountBalances((error, data) => console.log(data));
```

#### Streaming Quotes

```javascript
const msecs = 10 * 1000;
const symbols = ['msft', 'twtr', 'jcp', 'kors', 'uvxy'];

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

// stream for `msecs` milliseconds
setTimeout(c => c.abort(), msecs, stream);
```
