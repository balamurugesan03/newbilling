const { Sequelize } = require('sequelize');

// Database configuration
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || 'bala@12345';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_NAME = process.env.DB_NAME || 'dairy_billing';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false, // Set to console.log to see SQL queries
  define: {
    timestamps: true,
    freezeTableName: true
  }
});

module.exports = sequelize;
