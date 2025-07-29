const Bill = require("../models/Bill");

exports.getTodayDashboard = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const bills = await Bill.find({
      createdAt: { $gte: start, $lte: end },
    });

    let totalSales = 0;
    let totalGST = 0;
    const productSales = {};

    bills.forEach((bill) => {
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

    res.json({
      totalSales,
      totalGST,
      totalWithoutGST: totalSales - totalGST,
      productSales,
    });
  } catch (err) {
    res.status(500).json({ msg: "Dashboard fetch failed", error: err.message });
  }
};
