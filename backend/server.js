const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const billRoutes = require('./routes/billRoutes');
const dashboardRoutes = require("./routes/dashboardRoutes");
const billHistoryRoutes = require("./routes/billHistoryRoutes");
const yearlyReportRoutes = require("./routes/yearlyReportRoutes");
const authRoutes = require("./routes/authRoutes"); 
const User = require("./models/User"); 
const purchaseRoutes = require('./routes/purchaseRoutes');
const invoiceRoutes = require('./routes/purchaseInvoiceRoutes');    

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/dairy_billing')
  .then(async () => {
    console.log("✅ MongoDB Connected");

  
    app.listen(5000, () => console.log("🚀 Server running on port 5000"));
  })
  .catch(err => console.error(err));

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
