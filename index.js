require('dotenv').config();
const dns = require('dns');
const { URL } = require('url');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

// Stores URLS
const short_urls = new Map();

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Generate a unique id
function genShortURL() {
  var id = Math.random().toString(36).substring(2, 8);
  while (short_urls.has(id)) {
    id = Math.random().toString(36).substring(2, 8);
  }
  return id;
}

app.post("/api/shorturl", (req, res) => {
  // Parse the URL and hostname
  const link = req.body.url;
  const purl = new URL(link);
  const host = purl.hostname;

  // Validate URL
  dns.lookup(host, (err, address, family) => {
    if (err) res.json({ "error": "invalid url" });

    // Create id and save
    const id = genShortURL();
    short_urls.set(id, link);
    res.json({
      "original_url": link,
      "short_url": id // value is unique for each url
    });
  });
});

app.get("/api/shorturl/:url", (req, res) => {
  res.redirect(short_urls.get(req.params.url));
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
