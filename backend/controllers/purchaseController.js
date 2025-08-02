const Purchase = require('../models/purshase');
const Item = require('../models/Product');
const { Op, fn, col } = require('sequelize');

// Add Purchase
exports.addPurchase = async (req, res) => {
  try {
    // Create the purchase record
    const purchase = await Purchase.create(req.body);
    
    // Auto-create or update product in Items table
    if (purchase.itemCode && purchase.productName) {
      const existingProduct = await Item.findOne({ 
        where: { itemCode: purchase.itemCode }
      });

      if (existingProduct) {
        // Update existing product stock and prices
        await existingProduct.update({
          stockCount: existingProduct.stockCount + (purchase.openingStock || 0),
          purchaseRate: purchase.purchasePrice || existingProduct.purchaseRate,
          unitPrice: purchase.salePrice || existingProduct.unitPrice,
          mrp: purchase.mrp || existingProduct.mrp,
          gstPercent: purchase.gstRate || existingProduct.gstPercent,
          gstApplicable: purchase.gstRate > 0,
        });
        console.log(`✅ Updated existing product: ${purchase.productName}`);
      } else {
        // Create new product from purchase data
        await Item.create({
          itemCode: purchase.itemCode,
          hsCode: purchase.hsnSac || '',
          name: purchase.productName,
          mrp: purchase.mrp || purchase.salePrice || 0,
          purchaseRate: purchase.purchasePrice || 0,
          unitPrice: purchase.salePrice || purchase.purchasePrice || 0,
          gstPercent: purchase.gstRate || 0,
          gstApplicable: (purchase.gstRate || 0) > 0,
          stockCount: purchase.openingStock || 0,
          discount: purchase.saleDiscount || 0
        });
        console.log(`✅ Created new product: ${purchase.productName}`);
      }
    }

    res.status(201).json({
      ...purchase.toJSON(),
      message: 'Purchase added and product updated in inventory'
    });
  } catch (err) {
    console.error('Error adding purchase:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get All Purchases
exports.getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.findAll();
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get daily purchase report
exports.getDailyPurchaseReport = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Get purchases for the specific day
    const purchases = await Purchase.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        }
      },
      order: [['createdAt', 'DESC']]
    });

    // Calculate totals
    const totals = {
      totalPurchases: purchases.length,
      totalPurchaseValue: 0,
      totalStock: 0,
      totalItems: 0,
      avgPurchasePrice: 0,
      avgSalePrice: 0
    };

    purchases.forEach(purchase => {
      const purchaseValue = (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      totals.totalPurchaseValue += purchaseValue;
      totals.totalStock += purchase.openingStock || 0;
      totals.totalItems += 1;
      totals.avgPurchasePrice += purchase.purchasePrice || 0;
      totals.avgSalePrice += purchase.salePrice || 0;
    });

    if (purchases.length > 0) {
      totals.avgPurchasePrice = totals.avgPurchasePrice / purchases.length;
      totals.avgSalePrice = totals.avgSalePrice / purchases.length;
    }

    // Group by product category/type
    const categoryStats = {};
    purchases.forEach(purchase => {
      const category = purchase.type || 'Uncategorized';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          count: 0,
          totalValue: 0,
          totalStock: 0
        };
      }
      categoryStats[category].count++;
      categoryStats[category].totalValue += (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      categoryStats[category].totalStock += purchase.openingStock || 0;
    });

    res.json({
      date: date,
      purchases: purchases,
      totals: totals,
      categoryStats: categoryStats
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch daily purchase report", error: err.message });
  }
};

// Get purchase report by date range
exports.getPurchaseReportByRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const purchases = await Purchase.findAll({
      where: {
        createdAt: {
          [Op.gte]: start,
          [Op.lte]: end,
        }
      },
      order: [['createdAt', 'DESC']]
    });

    // Group by date
    const dailyData = {};
    purchases.forEach(purchase => {
      const date = purchase.createdAt.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          date: date,
          purchases: [],
          totalValue: 0,
          totalStock: 0,
          count: 0
        };
      }
      dailyData[date].purchases.push(purchase);
      dailyData[date].totalValue += (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      dailyData[date].totalStock += purchase.openingStock || 0;
      dailyData[date].count++;
    });

    // Convert to array and sort by date
    const dailyReport = Object.values(dailyData).sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate overall totals
    const overallTotals = {
      totalPurchases: purchases.length,
      totalPurchaseValue: 0,
      totalStock: 0,
      dateRange: `${startDate} to ${endDate}`
    };

    purchases.forEach(purchase => {
      overallTotals.totalPurchaseValue += (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      overallTotals.totalStock += purchase.openingStock || 0;
    });

    res.json({
      dateRange: `${startDate} to ${endDate}`,
      dailyReport: dailyReport,
      overallTotals: overallTotals,
      allPurchases: purchases
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch purchase report by range", error: err.message });
  }
};

// Get monthly purchase summary
exports.getMonthlyPurchaseSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const purchases = await Purchase.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        }
      },
      order: [['createdAt', 'DESC']]
    });

    // Group by day of month
    const dailySummary = {};
    for (let day = 1; day <= new Date(year, month, 0).getDate(); day++) {
      dailySummary[day] = {
        day: day,
        purchases: 0,
        totalValue: 0,
        totalStock: 0
      };
    }

    purchases.forEach(purchase => {
      const day = purchase.createdAt.getDate();
      dailySummary[day].purchases++;
      dailySummary[day].totalValue += (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      dailySummary[day].totalStock += purchase.openingStock || 0;
    });

    const monthlyTotals = {
      totalPurchases: purchases.length,
      totalPurchaseValue: 0,
      totalStock: 0,
      month: month,
      year: year
    };

    purchases.forEach(purchase => {
      monthlyTotals.totalPurchaseValue += (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      monthlyTotals.totalStock += purchase.openingStock || 0;
    });

    res.json({
      month: month,
      year: year,
      dailySummary: Object.values(dailySummary),
      monthlyTotals: monthlyTotals,
      purchases: purchases
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch monthly purchase summary", error: err.message });
  }
};

// Update
exports.updatePurchase = async (req, res) => {
  try {
    // Update the purchase
    await Purchase.update(req.body, {
      where: { id: req.params.id }
    });
    
    // Get the updated purchase
    const updatedPurchase = await Purchase.findByPk(req.params.id);
    
    // Sync with Item table if itemCode exists
    if (updatedPurchase && updatedPurchase.itemCode && updatedPurchase.productName) {
      const existingProduct = await Item.findOne({ 
        where: { itemCode: updatedPurchase.itemCode }
      });

      if (existingProduct) {
        // Update existing product with new purchase data
        await existingProduct.update({
          name: updatedPurchase.productName,
          purchaseRate: updatedPurchase.purchasePrice || existingProduct.purchaseRate,
          unitPrice: updatedPurchase.salePrice || existingProduct.unitPrice,
          mrp: updatedPurchase.mrp || existingProduct.mrp,
          gstPercent: updatedPurchase.gstRate || existingProduct.gstPercent,
          gstApplicable: (updatedPurchase.gstRate || 0) > 0,
          discount: updatedPurchase.saleDiscount || existingProduct.discount
        });
        console.log(`✅ Updated product from purchase: ${updatedPurchase.productName}`);
      }
    }
    
    res.json({
      ...updatedPurchase.toJSON(),
      message: 'Purchase updated and product synced'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get daily purchase report
exports.getDailyPurchaseReport = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Get purchases for the specific day
    const purchases = await Purchase.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        }
      },
      order: [['createdAt', 'DESC']]
    });

    // Calculate totals
    const totals = {
      totalPurchases: purchases.length,
      totalPurchaseValue: 0,
      totalStock: 0,
      totalItems: 0,
      avgPurchasePrice: 0,
      avgSalePrice: 0
    };

    purchases.forEach(purchase => {
      const purchaseValue = (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      totals.totalPurchaseValue += purchaseValue;
      totals.totalStock += purchase.openingStock || 0;
      totals.totalItems += 1;
      totals.avgPurchasePrice += purchase.purchasePrice || 0;
      totals.avgSalePrice += purchase.salePrice || 0;
    });

    if (purchases.length > 0) {
      totals.avgPurchasePrice = totals.avgPurchasePrice / purchases.length;
      totals.avgSalePrice = totals.avgSalePrice / purchases.length;
    }

    // Group by product category/type
    const categoryStats = {};
    purchases.forEach(purchase => {
      const category = purchase.type || 'Uncategorized';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          count: 0,
          totalValue: 0,
          totalStock: 0
        };
      }
      categoryStats[category].count++;
      categoryStats[category].totalValue += (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      categoryStats[category].totalStock += purchase.openingStock || 0;
    });

    res.json({
      date: date,
      purchases: purchases,
      totals: totals,
      categoryStats: categoryStats
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch daily purchase report", error: err.message });
  }
};

// Get purchase report by date range
exports.getPurchaseReportByRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const purchases = await Purchase.findAll({
      where: {
        createdAt: {
          [Op.gte]: start,
          [Op.lte]: end,
        }
      },
      order: [['createdAt', 'DESC']]
    });

    // Group by date
    const dailyData = {};
    purchases.forEach(purchase => {
      const date = purchase.createdAt.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          date: date,
          purchases: [],
          totalValue: 0,
          totalStock: 0,
          count: 0
        };
      }
      dailyData[date].purchases.push(purchase);
      dailyData[date].totalValue += (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      dailyData[date].totalStock += purchase.openingStock || 0;
      dailyData[date].count++;
    });

    // Convert to array and sort by date
    const dailyReport = Object.values(dailyData).sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate overall totals
    const overallTotals = {
      totalPurchases: purchases.length,
      totalPurchaseValue: 0,
      totalStock: 0,
      dateRange: `${startDate} to ${endDate}`
    };

    purchases.forEach(purchase => {
      overallTotals.totalPurchaseValue += (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      overallTotals.totalStock += purchase.openingStock || 0;
    });

    res.json({
      dateRange: `${startDate} to ${endDate}`,
      dailyReport: dailyReport,
      overallTotals: overallTotals,
      allPurchases: purchases
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch purchase report by range", error: err.message });
  }
};

// Get monthly purchase summary
exports.getMonthlyPurchaseSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const purchases = await Purchase.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        }
      },
      order: [['createdAt', 'DESC']]
    });

    // Group by day of month
    const dailySummary = {};
    for (let day = 1; day <= new Date(year, month, 0).getDate(); day++) {
      dailySummary[day] = {
        day: day,
        purchases: 0,
        totalValue: 0,
        totalStock: 0
      };
    }

    purchases.forEach(purchase => {
      const day = purchase.createdAt.getDate();
      dailySummary[day].purchases++;
      dailySummary[day].totalValue += (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      dailySummary[day].totalStock += purchase.openingStock || 0;
    });

    const monthlyTotals = {
      totalPurchases: purchases.length,
      totalPurchaseValue: 0,
      totalStock: 0,
      month: month,
      year: year
    };

    purchases.forEach(purchase => {
      monthlyTotals.totalPurchaseValue += (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      monthlyTotals.totalStock += purchase.openingStock || 0;
    });

    res.json({
      month: month,
      year: year,
      dailySummary: Object.values(dailySummary),
      monthlyTotals: monthlyTotals,
      purchases: purchases
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch monthly purchase summary", error: err.message });
  }
};

// Delete
exports.deletePurchase = async (req, res) => {
  try {
    await Purchase.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get daily purchase report
exports.getDailyPurchaseReport = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Get purchases for the specific day
    const purchases = await Purchase.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        }
      },
      order: [['createdAt', 'DESC']]
    });

    // Calculate totals
    const totals = {
      totalPurchases: purchases.length,
      totalPurchaseValue: 0,
      totalStock: 0,
      totalItems: 0,
      avgPurchasePrice: 0,
      avgSalePrice: 0
    };

    purchases.forEach(purchase => {
      const purchaseValue = (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      totals.totalPurchaseValue += purchaseValue;
      totals.totalStock += purchase.openingStock || 0;
      totals.totalItems += 1;
      totals.avgPurchasePrice += purchase.purchasePrice || 0;
      totals.avgSalePrice += purchase.salePrice || 0;
    });

    if (purchases.length > 0) {
      totals.avgPurchasePrice = totals.avgPurchasePrice / purchases.length;
      totals.avgSalePrice = totals.avgSalePrice / purchases.length;
    }

    // Group by product category/type
    const categoryStats = {};
    purchases.forEach(purchase => {
      const category = purchase.type || 'Uncategorized';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          count: 0,
          totalValue: 0,
          totalStock: 0
        };
      }
      categoryStats[category].count++;
      categoryStats[category].totalValue += (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      categoryStats[category].totalStock += purchase.openingStock || 0;
    });

    res.json({
      date: date,
      purchases: purchases,
      totals: totals,
      categoryStats: categoryStats
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch daily purchase report", error: err.message });
  }
};

// Get purchase report by date range
exports.getPurchaseReportByRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const purchases = await Purchase.findAll({
      where: {
        createdAt: {
          [Op.gte]: start,
          [Op.lte]: end,
        }
      },
      order: [['createdAt', 'DESC']]
    });

    // Group by date
    const dailyData = {};
    purchases.forEach(purchase => {
      const date = purchase.createdAt.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          date: date,
          purchases: [],
          totalValue: 0,
          totalStock: 0,
          count: 0
        };
      }
      dailyData[date].purchases.push(purchase);
      dailyData[date].totalValue += (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      dailyData[date].totalStock += purchase.openingStock || 0;
      dailyData[date].count++;
    });

    // Convert to array and sort by date
    const dailyReport = Object.values(dailyData).sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate overall totals
    const overallTotals = {
      totalPurchases: purchases.length,
      totalPurchaseValue: 0,
      totalStock: 0,
      dateRange: `${startDate} to ${endDate}`
    };

    purchases.forEach(purchase => {
      overallTotals.totalPurchaseValue += (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      overallTotals.totalStock += purchase.openingStock || 0;
    });

    res.json({
      dateRange: `${startDate} to ${endDate}`,
      dailyReport: dailyReport,
      overallTotals: overallTotals,
      allPurchases: purchases
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch purchase report by range", error: err.message });
  }
};

// Get monthly purchase summary
exports.getMonthlyPurchaseSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const purchases = await Purchase.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        }
      },
      order: [['createdAt', 'DESC']]
    });

    // Group by day of month
    const dailySummary = {};
    for (let day = 1; day <= new Date(year, month, 0).getDate(); day++) {
      dailySummary[day] = {
        day: day,
        purchases: 0,
        totalValue: 0,
        totalStock: 0
      };
    }

    purchases.forEach(purchase => {
      const day = purchase.createdAt.getDate();
      dailySummary[day].purchases++;
      dailySummary[day].totalValue += (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      dailySummary[day].totalStock += purchase.openingStock || 0;
    });

    const monthlyTotals = {
      totalPurchases: purchases.length,
      totalPurchaseValue: 0,
      totalStock: 0,
      month: month,
      year: year
    };

    purchases.forEach(purchase => {
      monthlyTotals.totalPurchaseValue += (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      monthlyTotals.totalStock += purchase.openingStock || 0;
    });

    res.json({
      month: month,
      year: year,
      dailySummary: Object.values(dailySummary),
      monthlyTotals: monthlyTotals,
      purchases: purchases
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch monthly purchase summary", error: err.message });
  }
};

// Sync all purchases with products table
exports.syncPurchasesWithProducts = async (req, res) => {
  try {
    const purchases = await Purchase.findAll();
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const purchase of purchases) {
      if (purchase.itemCode && purchase.productName) {
        const existingProduct = await Item.findOne({ 
          where: { itemCode: purchase.itemCode }
        });

        if (existingProduct) {
          // Update existing product
          await existingProduct.update({
            stockCount: existingProduct.stockCount + (purchase.openingStock || 0),
            purchaseRate: purchase.purchasePrice || existingProduct.purchaseRate,
            unitPrice: purchase.salePrice || existingProduct.unitPrice,
            mrp: purchase.mrp || existingProduct.mrp,
            gstPercent: purchase.gstRate || existingProduct.gstPercent,
            gstApplicable: (purchase.gstRate || 0) > 0,
          });
          updated++;
        } else {
          // Create new product
          await Item.create({
            itemCode: purchase.itemCode,
            hsCode: purchase.hsnSac || '',
            name: purchase.productName,
            mrp: purchase.mrp || purchase.salePrice || 0,
            purchaseRate: purchase.purchasePrice || 0,
            unitPrice: purchase.salePrice || purchase.purchasePrice || 0,
            gstPercent: purchase.gstRate || 0,
            gstApplicable: (purchase.gstRate || 0) > 0,
            stockCount: purchase.openingStock || 0,
            discount: purchase.saleDiscount || 0
          });
          created++;
        }
      } else {
        skipped++;
      }
    }

    res.json({
      message: 'Sync completed successfully',
      summary: {
        totalPurchases: purchases.length,
        productsCreated: created,
        productsUpdated: updated,
        skipped: skipped
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get daily purchase report
exports.getDailyPurchaseReport = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Get purchases for the specific day
    const purchases = await Purchase.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        }
      },
      order: [['createdAt', 'DESC']]
    });

    // Calculate totals
    const totals = {
      totalPurchases: purchases.length,
      totalPurchaseValue: 0,
      totalStock: 0,
      totalItems: 0,
      avgPurchasePrice: 0,
      avgSalePrice: 0
    };

    purchases.forEach(purchase => {
      const purchaseValue = (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      totals.totalPurchaseValue += purchaseValue;
      totals.totalStock += purchase.openingStock || 0;
      totals.totalItems += 1;
      totals.avgPurchasePrice += purchase.purchasePrice || 0;
      totals.avgSalePrice += purchase.salePrice || 0;
    });

    if (purchases.length > 0) {
      totals.avgPurchasePrice = totals.avgPurchasePrice / purchases.length;
      totals.avgSalePrice = totals.avgSalePrice / purchases.length;
    }

    // Group by product category/type
    const categoryStats = {};
    purchases.forEach(purchase => {
      const category = purchase.type || 'Uncategorized';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          count: 0,
          totalValue: 0,
          totalStock: 0
        };
      }
      categoryStats[category].count++;
      categoryStats[category].totalValue += (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      categoryStats[category].totalStock += purchase.openingStock || 0;
    });

    res.json({
      date: date,
      purchases: purchases,
      totals: totals,
      categoryStats: categoryStats
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch daily purchase report", error: err.message });
  }
};

// Get purchase report by date range
exports.getPurchaseReportByRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const purchases = await Purchase.findAll({
      where: {
        createdAt: {
          [Op.gte]: start,
          [Op.lte]: end,
        }
      },
      order: [['createdAt', 'DESC']]
    });

    // Group by date
    const dailyData = {};
    purchases.forEach(purchase => {
      const date = purchase.createdAt.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          date: date,
          purchases: [],
          totalValue: 0,
          totalStock: 0,
          count: 0
        };
      }
      dailyData[date].purchases.push(purchase);
      dailyData[date].totalValue += (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      dailyData[date].totalStock += purchase.openingStock || 0;
      dailyData[date].count++;
    });

    // Convert to array and sort by date
    const dailyReport = Object.values(dailyData).sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate overall totals
    const overallTotals = {
      totalPurchases: purchases.length,
      totalPurchaseValue: 0,
      totalStock: 0,
      dateRange: `${startDate} to ${endDate}`
    };

    purchases.forEach(purchase => {
      overallTotals.totalPurchaseValue += (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      overallTotals.totalStock += purchase.openingStock || 0;
    });

    res.json({
      dateRange: `${startDate} to ${endDate}`,
      dailyReport: dailyReport,
      overallTotals: overallTotals,
      allPurchases: purchases
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch purchase report by range", error: err.message });
  }
};

// Get monthly purchase summary
exports.getMonthlyPurchaseSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const purchases = await Purchase.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        }
      },
      order: [['createdAt', 'DESC']]
    });

    // Group by day of month
    const dailySummary = {};
    for (let day = 1; day <= new Date(year, month, 0).getDate(); day++) {
      dailySummary[day] = {
        day: day,
        purchases: 0,
        totalValue: 0,
        totalStock: 0
      };
    }

    purchases.forEach(purchase => {
      const day = purchase.createdAt.getDate();
      dailySummary[day].purchases++;
      dailySummary[day].totalValue += (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      dailySummary[day].totalStock += purchase.openingStock || 0;
    });

    const monthlyTotals = {
      totalPurchases: purchases.length,
      totalPurchaseValue: 0,
      totalStock: 0,
      month: month,
      year: year
    };

    purchases.forEach(purchase => {
      monthlyTotals.totalPurchaseValue += (purchase.purchasePrice || 0) * (purchase.openingStock || 0);
      monthlyTotals.totalStock += purchase.openingStock || 0;
    });

    res.json({
      month: month,
      year: year,
      dailySummary: Object.values(dailySummary),
      monthlyTotals: monthlyTotals,
      purchases: purchases
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch monthly purchase summary", error: err.message });
  }
};
