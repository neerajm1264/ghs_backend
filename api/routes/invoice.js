const express = require('express');
const { sendInvoiceEmail } = require('../models/invoiceController');
const router = express.Router();

// POST /api/invoice/send
router.post('/send', sendInvoiceEmail);

module.exports = router;
