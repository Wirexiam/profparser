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
        "User-Agent": "Mozilla/5.0",
      },
      timeout: 10000
    });

    const $ = cheerio.load(html);
    const article = $('article, .article, .content, main').first();
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
