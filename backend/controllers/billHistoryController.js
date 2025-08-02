// controllers/billController.js
const Bill = require("../models/Bill");
const { Op } = require('sequelize');


exports.getBillsByDateRange = async (req, res) => {
  const { start, end } = req.query;

  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999); 
    const bills = await Bill.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        }
      }
    });

    res.json(bills);
  } catch (error) {
    console.error("Error fetching bills:", error);
    res.status(500).json({ msg: "Server error", error });
  }
};
