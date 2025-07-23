const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

async function parseWithPuppeteer(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });

  const content = await page.evaluate(() => {
    const target = document.querySelector("main");
    if (!target) return "";
    return Array.from(target.querySelectorAll("h1,h2,h3,p,li"))
      .map(el => el.innerText.trim())
      .filter(Boolean)
      .join("\n\n");
  });

  await browser.close();
  return content;
}

async function parseWithAxios(url) {
  const { data: html } = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    },
    timeout: 10000
  });

  const $ = cheerio.load(html);
  const article = $("article, .article, .content, main").first();
  if (!article.length) return "";

  return article
    .find("h1,h2,h3,p,li")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .join("\n\n");
}

app.get("/parse", async (req, res) => {
  const url = req.query.url;
  const method = req.query.method || "axios"; // или puppeteer

  if (!url) return res.status(400).send("No URL provided");

  try {
    let text = '';
    if (method === "puppeteer") {
      text = await parseWithPuppeteer(url);
    } else {
      text = await parseWithAxios(url);
    }

    if (!text || text.length < 200) {
      return res.status(404).send("⚠️ Недостаточно текста");
    }

    res.send(text);
  } catch (e) {
    res.status(500).send("❌ Ошибка: " + e.message);
  }
});

app.get("/", (_, res) => {
  res.send("👋 Парсер работает. Используй /parse?url=...&method=axios|puppeteer");
});

app.listen(PORT, () => console.log(`🚀 Server ready on port ${PORT}`));
