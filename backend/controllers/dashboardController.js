const Bill = require("../models/Bill");
const { Op } = require('sequelize');

exports.getTodayDashboard = async (req, res) => {
  try {
    // === Today Range ===
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // === Month Range ===
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEnd = new Date();
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);
    monthEnd.setHours(23, 59, 59, 999);

    // === Today Bills ===
    const todayBills = await Bill.findAll({
      where: {
        createdAt: {
          [Op.gte]: todayStart,
          [Op.lte]: todayEnd,
        }
      }
    });

    // === Month Bills ===
    const monthBills = await Bill.findAll({
      where: {
        createdAt: {
          [Op.gte]: monthStart,
          [Op.lte]: monthEnd,
        }
      }
    });

    // === Today Totals ===
    let totalSales = 0;
    let totalGST = 0;
    const productSales = {};

    todayBills.forEach((bill) => {
      totalSales += bill.totalAmount;
      totalGST += bill.totalGST;

      bill.items.forEach((item) => {
        if (!productSales[item.name]) {
          productSales[item.name] = {
            quantity: 0,
            total: 0,
          };
        }
        productSales[item.name].quantity += item.quantity;
        productSales[item.name].total += item.total;
      });
    });

    // === Monthly Totals ===
    let monthlySales = 0;
    let monthlyGST = 0;

    monthBills.forEach((bill) => {
      monthlySales += bill.totalAmount;
      monthlyGST += bill.totalGST;
    });

    res.json({
      totalSales,
      totalGST,
      totalWithoutGST: totalSales - totalGST,
      productSales,
      monthlySales,
      monthlyGST,
      monthlyWithoutGST: monthlySales - monthlyGST,
    });

  } catch (err) {
    res.status(500).json({ msg: "Dashboard fetch failed", error: err.message });
  }
};
