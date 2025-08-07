// parser.js
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/parse", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("No URL provided");

  try {
    const { data: html } = await axios.get(url, {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-User": "?1"
  },
  timeout: 10000
});


    const $ = cheerio.load(html);
    const article = $('.entry-content, article, .article, .article__text, .content, main, [class^="MlchtUI-"]').first();
    if (!article.length) return res.status(404).send("No article found");

    const text = article
      .find("h1,h2,h3,p,li")
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean)
      .join("\n\n");

    res.send(text);
  } catch (e) {
    res.status(500).send("Error: " + e.message);
  }
});

app.get("/", (_, res) => {
  res.send("👋 Парсер работает. Используй /parse?url=...");
});

app.listen(PORT, () => console.log(`🚀 Server ready on port ${PORT}`));
