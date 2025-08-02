const Bill = require("../models/Bill");
const { Op } = require('sequelize');

exports.createBill = async (req, res) => {
  try {
    const { receivedAmount = 0, totalAmount = 0 } = req.body;

    const balanceAmount = totalAmount - receivedAmount;

    const bill = await Bill.create({
      ...req.body,
      receivedAmount,
      balanceAmount,
    });

    res.status(201).json(bill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.findAll({ order: [['createdAt', 'DESC']] });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMonthlyCreditReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and Year are required" });
    }

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const bills = await Bill.findAll({
      where: {
        isCredit: true,
        isPaid: false,
        date: {
          [Op.gte]: start,
          [Op.lte]: end,
        }
      }
    });

    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch credit report", error: err.message });
  }
};

exports.markBillAsPaid = async (req, res) => {
  try {
    await Bill.update({
      isPaid: true,
      paidDate: new Date(),
    }, {
      where: { id: req.params.id }
    });
    res.json({ success: true, message: "Bill marked as paid" });
  } catch (err) {
    res.status(500).json({ message: "Error updating bill", error: err.message });
  }
};
