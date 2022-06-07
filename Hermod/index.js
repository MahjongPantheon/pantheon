const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

// Configuration
const PORT = process.env.PORT || 4007;
const EXTERNAL_MIMIR = process.env.EXTERNAL_MIMIR || 'https://localhost:4001/';
const EXTERNAL_FREY = process.env.EXTERNAL_FREY || 'https://localhost:4004/';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * @type { { p: string, q: string, s: "Frey" | "Mimir" }[] }
 */
let queries = [];

app.get('/', (req, res) => {
  res.send('Hermod online; Queries in process: ' + queries.length);
})

app.post('/addQuery', (req, res) => {
  queries.push(req.body);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Hermod listening on port ${PORT}`);
})

let timer;
setInterval(() => {
  if (timer) {
    return;
  }

  timer = setInterval(() => {
    const query = queries.shift();
    if (!query) {
      clearInterval(timer);
      timer = null;
      return;
    }

    if (query.q.trim().toLowerCase().startsWith('select')) {
      return;
    }

    request.post({
      url: query.s === 'Mimir' ? EXTERNAL_MIMIR : EXTERNAL_FREY,
      formData: JSON.stringify({
        jsonrpc: '2.0',
        id: Math.ceil(Math.random() * 1000000),
        method: 'execQuery',
        params: [query.q.trim(), query.p]
      })
    }, (err) => {
      if (err) { return console.log(err); }
    });
  }, 100);
}, 1500);
