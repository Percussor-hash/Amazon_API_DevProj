const express = require('express');
const puppeteer = require('puppeteer');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT;
app.use(bodyParser.json());

const MAX_RETRIES = 3; // Maximum number of retry attempts
const RETRY_DELAY = 10000; // Delay between retries in milliseconds

let allProducts = []; // Array to store products from all pages

app.use(cors()); // Add parentheses to invoke the cors middleware

//const MAX_RETRIES = 3; // Maximum number of retry attempts



function isValidSearchQuery(query, pages) {
  // Remove leading and trailing whitespace
  query = query.replace(/\s/g, '');
  
  // Check if the query is empty
  if (query.length === 0) {
    return false;
  }
  if (!/^\d+$/.test(pages)) {
    if(pages != ""){
      return false;
    }
  }
  // Add additional validation criteria as per your requirements
  if (!/^[a-zA-Z0-9-_]+$/.test(query)) {
    return false;
  }
  // Return true if the query passes all validation checks
  return true;
}

//GET
app.get('/search', async (req, res) => {
  let retryCount = 0;
  let currentPage = 1;

  const searchQuery = req.query.title;
  const pages = req.query.maxPages;
  if (!isValidSearchQuery(searchQuery, pages)) {
    console.log("Invalid search query.");
    res.send("Invalid Input query or no.of pages,\n Try again.")
  } else {
    console.log("Search query is valid.");

  const maxPages = parseInt(pages) || 20; // Maximum number of pages to scrape, defaulting to 20 if not provided

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
  console.log(`Scraped all pages requested`);
  res.json(allProducts);
}});


//POST
app.post('/search', async (req, res) => {
  let retryCount = 0;
  let currentPage = 1;

  const searchQuery = req.body.title;
  const pages = req.body.maxPages;
  if (!isValidSearchQuery(searchQuery, pages)) {
    console.log("Invalid search query.");
    res.send("Invalid Input query or no.of pages,\n Try again.")
  } else {
    console.log("Search query is valid.");
  

  const maxPages = pages || 20; // Maximum number of pages to scrape, defaulting to 20 if not provided

  
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
  console.log(`Scraped all pages requested`);
  res.json(allProducts);
}});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});