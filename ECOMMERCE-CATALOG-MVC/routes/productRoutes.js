const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

const {
  createProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getProductsByColor,
  searchProducts,
  updateProduct,
  addVariant,
  updateVariantStock,
  deleteProduct,
  removeVariant,
  getStatistics
} = productController;

// Product routes
router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/stats', getStatistics);
router.get('/search', searchProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/by-color/:color', getProductsByColor);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

// Variant routes (nested)
router.post('/:id/variants', addVariant);
router.put('/:productId/variants/:variantId/stock', updateVariantStock);
router.delete('/:productId/variants/:variantId', removeVariant);

module.exports = router;