const Product = require('../models/Product');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      itemCode,
      hsCode,
      barcode,
      mrp,
      purchaseRate,
      unitPrice,
      gstPercent,
      gstApplicable,
      stockCount,
      productionDate,
      expiryDate
    } = req.body;

    const product = await Product.create({
      name,
      itemCode,
      hsCode,
      barcode,
      mrp,
      purchaseRate,
      unitPrice,
      gstPercent,
      gstApplicable,
      stockCount,
      productionDate,
      expiryDate
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({ order: [['createdAt', 'DESC']] });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    await Product.update(req.body, { where: { id: req.params.id } });
    const updated = await Product.findByPk(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    await Product.destroy({ where: { id: req.params.id } });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Reduce stock
exports.reduceStock = async (req, res) => {
  try {
    const { productId, quantitySold } = req.body;

    const product = await Product.findByPk(productId);

    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.stockCount < quantitySold) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    product.stockCount -= quantitySold;
    await product.save();

    res.json({ message: "Stock reduced", remainingStock: product.stockCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
