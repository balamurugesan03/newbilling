const express = require('express');
const { Sequelize } = require('sequelize');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const billRoutes = require('./routes/billRoutes');
const dashboardRoutes = require("./routes/dashboardRoutes");
const billHistoryRoutes = require("./routes/billHistoryRoutes");
const yearlyReportRoutes = require("./routes/yearlyReportRoutes");
const authRoutes = require('./routes/authRoutes');
const User = require("./models/User"); 
const purchaseRoutes = require('./routes/purchaseRoutes');
const invoiceRoutes = require('./routes/purchaseInvoiceRoutes');    

const app = express();
app.use(cors());
app.use(express.json());

// Auto-create database if it doesn't exist
const createDatabase = async () => {
  const DB_USER = process.env.DB_USER || 'root';
  const DB_PASS = process.env.DB_PASS || 'bala@12345';
  const DB_HOST = process.env.DB_HOST || 'localhost';
  const DB_PORT = process.env.DB_PORT || 3306;
  const DB_NAME = process.env.DB_NAME || 'dairy_billing';

  // Connect without specifying database
  const tempSequelize = new Sequelize('', DB_USER, DB_PASS, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: false
  });

  try {
    await tempSequelize.authenticate();
    console.log("✅ MySQL Connection established");
    
    // Create database if it doesn't exist
    await tempSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    console.log("✅ Database ensured");
    
    await tempSequelize.close();
  } catch (error) {
    console.error("❌ Error creating database:", error.message);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    await createDatabase();
    
    // Now connect to the specific database
    const sequelize = require('./config/db');
    await sequelize.authenticate();
    console.log("✅ MySQL Connected to dairy_billing");
    
    await sequelize.sync({ force: false });
    console.log("✅ Database synced");

    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Server startup failed:", err.message);
    process.exit(1);
  }
};

startServer();

// Routes
app.use('/api/products', productRoutes);
app.use('/api/bills', billRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/bill-history", billHistoryRoutes);
app.use("/api/yearly-report", yearlyReportRoutes);
app.use("/api/auth", authRoutes); 
app.use('/api/purchases', purchaseRoutes);
app.use('/api/invoices', invoiceRoutes); 

// // ✅ Function to create default admin
// async function createDefaultAdmin() {
//   const exists = await User.findOne({ username: "admin" });
//   if (!exists) {
//     await User.create({ username: "admin", password: "admin123" });
//     console.log("✅ Default admin created: admin / admin123");
//   }
// }
