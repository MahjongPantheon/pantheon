const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = 4007;
const EXTERNAL_MIMIR = 'https://g.riichi.top/';
const EXTERNAL_FREY = 'https://u.riichi.top/';

let queries = [];

app.get('/', (req, res) => {
  res.send('Hermod online');
})

app.post('/addQuery', (req, res) => {
  queries.push(req.body);
  res.sendStatus(200);
});

app.get('/queries', (req, res) => {
  res.send(JSON.stringify(queries));
});

app.listen(PORT, () => {
  console.log(`Hermod listening on port ${PORT}`);
})

setInterval(() => {
  const query = queries.shift();
  if (!query || query.q.trim().toLowerCase().startsWith('select')) {
    return;
  }

  request.post({
    url: query.s === 'Mimir' ? EXTERNAL_MIMIR : EXTERNAL_FREY,
    formData: JSON.stringify({
      jsonrpc: '2.0',
      id: Math.ceil(Math.random() * 1000000),
      method: 'execQuery',
      params: [query.q.trim()]
    })
  }, (err) => {
    if (err) { return console.log(err); }
  });
}, 500);
