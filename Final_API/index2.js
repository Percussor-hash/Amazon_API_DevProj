const express = require('express');
const puppeteer = require('puppeteer');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');

const isValidSearchQuery = require('./utils/validation');

const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.json());
app.use(cors());

const MAX_RETRIES = 3;
const RETRY_DELAY = 10000;

let allProducts = [];

async function scrapePage(title, page) {
  await page.goto('https://www.amazon.com/');
  await page.type('#twotabsearchtextbox', title);
  await page.click('#nav-search-submit-button');
  await page.waitForNavigation();

  const productsOnPage = await page.evaluate(() => {
    const products = [];
    const productCards = document.querySelectorAll('.s-result-item .s-card-border');
    productCards.forEach((card) => {
      const name = card.querySelector('h2 > a > span');
      const wholePrice = card.querySelector('.a-price-whole');
      const fractionPrice = card.querySelector('.a-price-fraction');
      const image = card.querySelector('img');
      if (name && wholePrice && image) {
        const formattedPrice = `${parseInt(wholePrice.innerText)}.${parseInt(fractionPrice.innerText)}`;
        const product = {
          name: name.innerText,
          price: parseFloat(formattedPrice),
          image: image.getAttribute('src')
        };
        products.push(product);
      }
    });
    return products;
  });

  return productsOnPage;
}

async function scrapeAmazon(title, maxPages) {
  let retryCount = 0;
  let currentPage = 1;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');

  while (currentPage <= maxPages) {
    try {
      console.log(`Scraping page ${currentPage}...`);
      const productsOnPage = await scrapePage(title, page);
      allProducts = allProducts.concat(productsOnPage);
      currentPage++;
    } catch (error) {
      console.error(`Error occurred. Retrying (${retryCount}/${MAX_RETRIES})...`);
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }

  await browser.close();

  console.log(`Scraped ${allProducts.length} product(s)`);
  return allProducts;
}

// GET endpoint for search
app.get('/search', async (req, res) => {
  const { title, maxPages = 20 } = req.query;

  if (!isValidSearchQuery(title)) {
    return res.status(400).send('Invalid search query.');
  }

  const scrapedProducts = await scrapeAmazon(title, maxPages);
  res.json(scrapedProducts);
});

// POST endpoint for search
app.post('/search', async (req, res) => {
  const { title, maxPages = 20 } = req.body;

  if (!isValidSearchQuery(title)) {
    return res.status(400).send('Invalid search query.');
  }

  const scrapedProducts = await scrapeAmazon(title, maxPages);
  res.json(scrapedProducts);
});

// DELETE endpoint to clear search results
app.delete('/search', (req, res) => {
  allProducts = []; // Clear allProducts array
  res.send('Search results cleared.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});