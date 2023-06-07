const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

const options = {
  method: 'GET',
  url: 'https://amazon-data-product-scraper.p.rapidapi.com/products/B08N5LM1K3',
  params: {
    api_key: '548851825ac43f460f8ec20f2c8ab823'
  },
  headers: {
    'X-RapidAPI-Key': 'bc018595a0msh4a83604bf95ea9fp18ed13jsna926406a9130',
    'X-RapidAPI-Host': 'amazon-data-product-scraper.p.rapidapi.com'
  }
};

// Endpoint for search API
app.get('/search', async (req, res) => {
  const { query } = req.query;

  try {
    // Make a request to the Amazon Data Product Scraper API
    const response = await axios.request(options);
    
    // Extract the relevant data from the response based on the search query
    const results = response.data.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );

    // Return search results in JSON format
    res.json(results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
