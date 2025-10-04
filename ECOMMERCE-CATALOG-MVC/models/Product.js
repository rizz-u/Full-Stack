const mongoose = require('mongoose');

// Define Variant Schema (Nested Schema)
const variantSchema = new mongoose.Schema({
  color: {
    type: String,
    required: [true, 'Variant color is required'],
    trim: true
  },
  size: {
    type: String,
    required: [true, 'Variant size is required'],
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'],
    uppercase: true
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }]
}, { _id: true }); // _id is auto-generated for each variant

// Define Main Product Schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [3, 'Product name must be at least 3 characters'],
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: {
      values: ['Electronics', 'Clothing', 'Footwear', 'Accessories', 'Home', 'Sports', 'Books', 'Other'],
      message: '{VALUE} is not a valid category'
    }
  },
  brand: {
    type: String,
    trim: true
  },
  variants: {
    type: [variantSchema],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Product must have at least one variant'
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' }); // Text search
productSchema.index({ category: 1, price: 1 }); // Filter by category and price
productSchema.index({ 'variants.color': 1 }); // Filter by variant color
productSchema.index({ 'variants.stock': 1 }); // Check stock availability

// Virtual property: Total stock across all variants
productSchema.virtual('totalStock').get(function() {
  return this.variants.reduce((sum, variant) => sum + variant.stock, 0);
});

// Virtual property: Available colors
productSchema.virtual('availableColors').get(function() {
  return [...new Set(this.variants.map(v => v.color))];
});

// Virtual property: Available sizes
productSchema.virtual('availableSizes').get(function() {
  return [...new Set(this.variants.map(v => v.size))];
});

// Instance method: Check if product is in stock
productSchema.methods.isInStock = function() {
  return this.totalStock > 0;
};

// Instance method: Get variants by color
productSchema.methods.getVariantsByColor = function(color) {
  return this.variants.filter(v => v.color.toLowerCase() === color.toLowerCase());
};

// Instance method: Get lowest price variant
productSchema.methods.getLowestPriceVariant = function() {
  return this.variants.reduce((min, variant) => 
    variant.stock > 0 && (!min || this.price < min.price) ? variant : min
  , null);
};

// Static method: Find products by category
productSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ createdAt: -1 });
};

// Static method: Find products by color
productSchema.statics.findByColor = function(color) {
  return this.find({ 
    'variants.color': new RegExp(color, 'i'),
    isActive: true 
  });
};

// Static method: Find products in stock
productSchema.statics.findInStock = function() {
  return this.find({ 
    'variants.stock': { $gt: 0 },
    isActive: true 
  });
};

// Pre-save middleware: Generate SKU if not provided
productSchema.pre('save', function(next) {
  this.variants.forEach(variant => {
    if (!variant.sku) {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 7);
      variant.sku = `${this.category.substring(0, 3).toUpperCase()}-${timestamp}-${random}`.toUpperCase();
    }
  });
  next();
});

// Ensure virtuals are included when converting to JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;