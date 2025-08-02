const Bill = require("../models/Bill");
const { Op } = require('sequelize');

// Debug endpoint
exports.getDebugDashboard = async (req, res) => {
  try {
    const bills = await Bill.findAll({ limit: 2 });
    console.log('Raw bills:', JSON.stringify(bills, null, 2));
    
    let total = 0;
    bills.forEach(bill => {
      console.log('Bill amount:', bill.totalAmount, 'Type:', typeof bill.totalAmount);
      console.log('Parsed:', parseFloat(bill.totalAmount));
      total += parseFloat(bill.totalAmount) || 0;
      console.log('Running total:', total);
    });
    
    res.json({ bills, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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
      },
      raw: true
    });

    // === Month Bills ===
    const monthBills = await Bill.findAll({
      where: {
        createdAt: {
          [Op.gte]: monthStart,
          [Op.lte]: monthEnd,
        }
      },
      raw: true
    });

    // === Today Totals ===
    const todayTotals = todayBills.reduce((acc, bill) => {
      const amount = Number(bill.totalAmount);
      const gst = Number(bill.totalGST);
      
      return {
        totalSales: acc.totalSales + (isNaN(amount) ? 0 : amount),
        totalGST: acc.totalGST + (isNaN(gst) ? 0 : gst)
      };
    }, { totalSales: 0, totalGST: 0 });

    // === Product Sales ===
    const productSales = {};
    todayBills.forEach((bill) => {
      if (bill.items && Array.isArray(bill.items)) {
        bill.items.forEach((item) => {
          if (!productSales[item.name]) {
            productSales[item.name] = {
              quantity: 0,
              total: 0,
            };
          }
          productSales[item.name].quantity += Number(item.quantity) || 0;
          productSales[item.name].total += Number(item.total) || 0;
        });
      }
    });

    // === Monthly Totals ===
    const monthlyTotals = monthBills.reduce((acc, bill) => {
      const amount = Number(bill.totalAmount);
      const gst = Number(bill.totalGST);
      
      return {
        monthlySales: acc.monthlySales + (isNaN(amount) ? 0 : amount),
        monthlyGST: acc.monthlyGST + (isNaN(gst) ? 0 : gst)
      };
    }, { monthlySales: 0, monthlyGST: 0 });

    res.json({
      totalSales: Number(todayTotals.totalSales.toFixed(2)),
      totalGST: Number(todayTotals.totalGST.toFixed(2)),
      totalWithoutGST: Number((todayTotals.totalSales - todayTotals.totalGST).toFixed(2)),
      productSales,
      monthlySales: Number(monthlyTotals.monthlySales.toFixed(2)),
      monthlyGST: Number(monthlyTotals.monthlyGST.toFixed(2)),
      monthlyWithoutGST: Number((monthlyTotals.monthlySales - monthlyTotals.monthlyGST).toFixed(2)),
    });

  } catch (err) {
    res.status(500).json({ msg: "Dashboard fetch failed", error: err.message });
  }
};
