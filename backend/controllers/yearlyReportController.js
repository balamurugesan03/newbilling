const Bill = require("../models/Bill");
const { Op, fn, col, literal } = require("sequelize");

exports.getYearlyReport = async (req, res) => {
  const { year } = req.query;
  const selectedYear = parseInt(year);

  try {
    const start = new Date(`${selectedYear}-01-01`);
    const end = new Date(`${selectedYear + 1}-01-01`);

    const bills = await Bill.findAll({
      where: {
        createdAt: {
          [Op.gte]: start,
          [Op.lt]: end,
        }
      },
      attributes: [
        [fn('MONTH', col('createdAt')), 'month'],
        [fn('SUM', col('totalAmount')), 'totalAmount'],
        [fn('SUM', col('totalGST')), 'totalGST'],
        [literal('SUM(totalAmount) - SUM(totalGST)'), 'totalWithoutGST']
      ],
      group: [fn('MONTH', col('createdAt'))],
      order: [[fn('MONTH', col('createdAt')), 'ASC']],
      raw: true
    });

    // Transform to match frontend expectations
    const transformedBills = bills.map(bill => ({
      month: bill.month,
      totalAmount: parseFloat(bill.totalAmount) || 0,
      totalGST: parseFloat(bill.totalGST) || 0,
      totalWithoutGST: parseFloat(bill.totalWithoutGST) || 0,
      profit: parseFloat(bill.totalAmount) || 0 // Simplified profit calculation
    }));

    res.json(transformedBills);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch yearly report" });
  }
};
