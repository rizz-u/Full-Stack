const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

dotenv.config();

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
  res.json({
    message: '🛒 E-commerce Catalog API',
    version: '1.0.0',
    endpoints: {
      'POST /api/products': 'Create product with variants',
      'GET /api/products': 'Get all products',
      'GET /api/products/:id': 'Get product by ID',
      'GET /api/products/category/:category': 'Get products by category',
      'GET /api/products/by-color/:color': 'Get products by color',
      'GET /api/products/search?q=term': 'Search products',
      'PUT /api/products/:id': 'Update product',
      'DELETE /api/products/:id': 'Delete product',
      'POST /api/products/:id/variants': 'Add variant',
      'PUT /api/products/:productId/variants/:variantId/stock': 'Update variant stock',
      'DELETE /api/products/:productId/variants/:variantId': 'Remove variant',
      'GET /api/products/stats': 'Get statistics'
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});