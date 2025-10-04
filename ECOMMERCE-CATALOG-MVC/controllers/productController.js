const Product = require('../models/Product');

// CREATE - Add a new product with variants
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, variants, tags } = req.body;

    // Validate variants
    if (!variants || variants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product must have at least one variant'
      });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      brand,
      variants,
      tags
    });

    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// READ - Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    if (req.query.inStock === 'true') {
      filter['variants.stock'] = { $gt: 0 };
    }

    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalProducts = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: products.length,
      total: totalProducts,
      page,
      totalPages: Math.ceil(totalProducts / limit),
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// READ - Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// READ - Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.findByCategory(req.params.category);

    res.status(200).json({
      success: true,
      count: products.length,
      category: req.params.category,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products by category',
      error: error.message
    });
  }
};

// READ - Get products by color (nested query)
exports.getProductsByColor = async (req, res) => {
  try {
    const color = req.params.color;
    const products = await Product.findByColor(color);

    res.status(200).json({
      success: true,
      count: products.length,
      color: color,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products by color',
      error: error.message
    });
  }
};

// READ - Search products
exports.searchProducts = async (req, res) => {
  try {
    const searchTerm = req.query.q;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const products = await Product.find({
      $text: { $search: searchTerm },
      isActive: true
    }).sort({ score: { $meta: 'textScore' } });

    res.status(200).json({
      success: true,
      count: products.length,
      searchTerm,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
};

// UPDATE - Update product
exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// UPDATE - Add variant to product
exports.addVariant = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.variants.push(req.body);
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Variant added successfully',
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error adding variant',
      error: error.message
    });
  }
};

// UPDATE - Update variant stock
exports.updateVariantStock = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { stock } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const variant = product.variants.id(variantId);

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found'
      });
    }

    variant.stock = stock;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Variant stock updated successfully',
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating variant stock',
      error: error.message
    });
  }
};

// DELETE - Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// DELETE - Remove variant from product
exports.removeVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.variants.id(variantId).remove();
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Variant removed successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing variant',
      error: error.message
    });
  }
};

// GET - Product statistics
exports.getStatistics = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    
    const categoryStats = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      { $sort: { count: -1 } }
    ]);

    const totalVariants = await Product.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$variants' },
      { $group: { _id: null, total: { $sum: 1 }, totalStock: { $sum: '$variants.stock' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        categoryDistribution: categoryStats,
        variantStats: totalVariants[0] || { total: 0, totalStock: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};