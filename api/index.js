const express = require('express');
const puppeteer = require('puppeteer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

const MAX_RETRIES = 3; // Maximum number of retry attempts
const RETRY_DELAY = 10000; // Delay between retries in milliseconds

app.get('/search', async (req, res) => {
  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.goto('https://www.amazon.in/');
      await page.type('#twotabsearchtextbox', req.query.title);
      await page.click('#nav-search-submit-button');
      await page.waitForNavigation();

      const products = await page.evaluate(() => {
        const results = [];
        const items = document.querySelectorAll('.s-result-item');
        items.forEach((item) => {
          const title = item.querySelector('.a-text-normal');
          const price = item.querySelector('.a-price-whole');
          const image = item.querySelector('img');
          if (title && price && image) {
            const product = {
              title: title.innerText,
              price: parseFloat(price.innerText.replace(/[^0-9.]/g, '')),
              image: image.getAttribute('src')
            };
            results.push(product);
          }
        });
        return results;
      });

      await browser.close();

      res.json(products);
      return; // Exit the endpoint function after a successful response
    } catch (error) {
      retryCount++;
      console.log(`Error occurred. Retrying (${retryCount}/${MAX_RETRIES})...`);
      await delay(RETRY_DELAY); // Wait before retrying
    }
  }

  // If all retry attempts fail, return an error response
  res.status(500).json({ error: 'An error occurred' });
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
