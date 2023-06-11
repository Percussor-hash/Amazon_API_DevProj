const express = require('express');
const puppeteer = require('puppeteer');
require('dotenv').config();
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT;
app.use(bodyParser.json());

//const MAX_RETRIES = 3; // Maximum number of retry attempts
const RETRY_DELAY = 10000; // Delay between retries in milliseconds

let allProducts = []; // Array to store products from all pages


//GET
app.get('/search', async (req, res) => {
  let retryCount = 0;
  let currentPage = 1;

  const maxPages = parseInt(req.query.maxPages) || 20; // Maximum number of pages to scrape, defaulting to 20 if not provided

  while (currentPage <= maxPages) {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.goto('https://www.amazon.com/');
      await page.type('#twotabsearchtextbox', req.query.title);
      await page.click('#nav-search-submit-button');
      await page.waitForNavigation();

      console.log(`Scraping page ${currentPage}...`);

      const products = await page.evaluate(() => {
        const results = [];
        const items = document.querySelectorAll('.s-result-item .s-card-border');
        items.forEach((item) => {
            const title = item.querySelector('h2 > a > span');
            const price = item.querySelector('.a-price-whole');
            const cents = item.querySelector('.a-price-fraction');
            const image = item.querySelector('img');
          if (title && price && image) {
            const formattedPrice = `${parseInt(price.innerText)}.${parseInt(cents.innerText)}`;
            const product = {
              title: title.innerText,
              price: parseFloat(formattedPrice),
              image: image.getAttribute('src')
            };
            results.push(product);
          }
        });
        return results;
      });

      allProducts = allProducts.concat(products);

      await browser.close();

      currentPage++;
    } catch (error) {
      retryCount++;
      console.log(`Error occurred. Retrying (${retryCount}/${maxPages})...`);
      await delay(RETRY_DELAY); // Wait before retrying
    }
  }

  res.json(allProducts);
});


//POST
app.post('/search', async (req, res) => {
  let retryCount = 0;
  let currentPage = 1;

  const maxPages = req.body.maxPages || 20; // Maximum number of pages to scrape, defaulting to 20 if not provided

  while (currentPage <= maxPages) {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.goto('https://www.amazon.com/');
      await page.type('#twotabsearchtextbox', req.body.title);
      await page.click('#nav-search-submit-button');
      await page.waitForNavigation();

      console.log(`Scraping page ${currentPage}...`);

      const products = await page.evaluate(() => {
        const results = [];
        const items = document.querySelectorAll('.s-result-item .s-card-border');
        items.forEach((item) => {
            const title = item.querySelector('h2 > a > span');
            const price = item.querySelector('.a-price-whole');
            const cents = item.querySelector('.a-price-fraction');
            const image = item.querySelector('img');
          if (title && price && image) {
            const formattedPrice = `${parseInt(price.innerText)}.${parseInt(cents.innerText)}`;
            const product = {
              title: title.innerText,
              price: parseFloat(formattedPrice),
              image: image.getAttribute('src')
            };
            results.push(product);
          }
        });
        return results;
      });

      allProducts = allProducts.concat(products);

      await browser.close();

      currentPage++;
    } catch (error) {
      retryCount++;
      console.log(`Error occurred. Retrying (${retryCount}/${maxPages})...`);
      await delay(RETRY_DELAY); // Wait before retrying
    }
  }

  res.json(allProducts);
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
