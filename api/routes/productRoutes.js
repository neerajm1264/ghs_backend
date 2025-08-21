const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { v4: uuidv4 } = require('uuid');

// Create a new product
router.post('/', async (req, res) => {
  try {
    const { name, price, image, category, varieties } = req.body;
    const id = uuidv4();  // Generate a unique ID
    const newProduct = new Product({ name, price, image, category, varieties, id });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
});

// Fetch all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error });
  }
});

// Delete a product
router.delete('/', async (req, res) => {
  try {
    const { name, price } = req.body;

    const deletedProduct = await Product.findOneAndDelete({
      name,
      price,
    });

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error });
  }
});

module.exports = router;
