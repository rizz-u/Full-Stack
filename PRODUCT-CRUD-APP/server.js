const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/productDB';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  });

// Import Routes
const productRoutes = require('./routes/products');

// Use Routes
app.use('/products', productRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'Product CRUD API',
    endpoints: {
      'GET /products': 'Get all products',
      'GET /products/:id': 'Get a product by ID',
      'POST /products': 'Create a new product',
      'PUT /products/:id': 'Update a product by ID',
      'DELETE /products/:id': 'Delete a product by ID'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});