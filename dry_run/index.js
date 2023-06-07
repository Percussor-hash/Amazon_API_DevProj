const express = require('express');

const app = express();
require('dotenv').config()

// Mock data for demonstration purposes
const products = [
  { id: 1, name: 'Product 1', price: 10 },
  { id: 2, name: 'Product 2', price: 20 },
  { id: 3, name: 'Product 3', price: 30 },
  { id: 4, name: 'Product 4', price: 40 },
];

// Endpoint for search API
app.get('/search', (req, res) => {
  const { query } = req.query;

  // Perform search based on query
  const results = products.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );

  // Return search results in JSON format
  res.json(results);
});
//import port from .env file
const PORT = process.env.PORT
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
