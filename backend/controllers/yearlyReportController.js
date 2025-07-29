const Bill = require("../models/Bill");
const mongoose = require("mongoose");

exports.getYearlyReport = async (req, res) => {
  const { year } = req.query;
  const selectedYear = parseInt(year);

  try {
    const start = new Date(`${selectedYear}-01-01`);
    const end = new Date(`${selectedYear + 1}-01-01`);

    const bills = await Bill.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $unwind: "$items", // Expand each item in the bill
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          totalAmount: 1,
          totalGST: 1,
          itemTotal: { $multiply: ["$items.qty", "$items.purchasePrice"] }, // Cost for this item
        },
      },
      {
        $group: {
          _id: "$month",
          totalAmount: { $sum: "$totalAmount" }, // Sale
          totalGST: { $sum: "$totalGST" },
          totalCost: { $sum: "$itemTotal" }, // Cost
        },
      },
      {
        $project: {
          month: "$_id",
          totalAmount: 1,
          totalGST: 1,
          totalCost: 1,
          profit: { $subtract: ["$totalAmount", "$totalCost"] }, // Profit = Sale - Cost
          _id: 0,
        },
      },
      { $sort: { month: 1 } },
    ]);

    res.json(bills);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch yearly report" });
  }
};
