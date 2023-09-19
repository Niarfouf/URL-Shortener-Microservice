require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('node:dns');
const bodyParser = require("body-parser");
const fs = require("fs");
const path = "url.json";
app.use(bodyParser.urlencoded({ extended: false }));
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let data = fs.readFileSync(path);
let urlJson = JSON.parse(data);


// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.route("/api/shorturl").get(function(req, res) {
  res.type('txt').send('Not found');
})
  .post(function(req, res) {
  let url = req.body.url;
  let host = url.match(/[a-z0-9\-]*\.[a-z]*(?=\/)/g);
  if (! host) {
    res.json({ error: 'invalid url' });
  }
  else {
  dns.lookup(host[0], function(err) {
    if (err) {
      res.json({ error: 'invalid url' });
    }
    else {
      let found = urlJson.urls.find((element) => element.original_url == url)
      if (found) {
        res.json(found)
      }
      else {
      let length = urlJson.urls.length;
      urlJson.urls.push({"original_url": url, "short_url": length+1});
      fs.writeFileSync(path, JSON.stringify(urlJson));
      res.json({"original_url": url, "short_url": length+1});
    }
    }
  })}
  });

app.get("/api/shorturl/:short_url", function(req, res) {
  let short_url = req.params.short_url
  let urlFound = urlJson.urls.find((element) => element.short_url == short_url)
  if (urlFound) {
    res.redirect(urlFound.original_url);
  }
  else {
    res.json({ error: 'No short URL found for the given input' });
  }
  
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
