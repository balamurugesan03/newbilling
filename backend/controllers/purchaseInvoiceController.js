const PurchaseInvoice = require('../models/purchaseInvoice');

exports.createPurchaseInvoice = async (req, res) => {
  try {
    const invoice = new PurchaseInvoice(req.body);
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllPurchaseInvoices = async (req, res) => {
  try {
    const data = await PurchaseInvoice.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await PurchaseInvoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
