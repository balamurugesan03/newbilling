<?php

namespace App\Config;

use PDO;
use PDOException;

class Database
{
    private static $instance = null;
    private $connection;

    private function __construct()
    {
        $host = $_ENV['DB_HOST'] ?? 'localhost';
        $port = $_ENV['DB_PORT'] ?? 3306;
        $database = $_ENV['DB_DATABASE'] ?? 'dairy_billing';
        $username = $_ENV['DB_USERNAME'] ?? 'root';
        $password = $_ENV['DB_PASSWORD'] ?? 'bala@12345';

        try {
            // First create database if it doesn't exist
            $tempDsn = "mysql:host=$host;port=$port;charset=utf8mb4";
            $tempConnection = new PDO($tempDsn, $username, $password);
            $tempConnection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            $tempConnection->exec("CREATE DATABASE IF NOT EXISTS `$database`");
            
            // Now connect to the specific database
            $dsn = "mysql:host=$host;port=$port;dbname=$database;charset=utf8mb4";
            $this->connection = new PDO($dsn, $username, $password);
            $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
            $this->createTables();
            
        } catch (PDOException $e) {
            die("Database connection failed: " . $e->getMessage());
        }
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection()
    {
        return $this->connection;
    }

    private function createTables()
    {
        $tables = [
            "CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )",
            
            "CREATE TABLE IF NOT EXISTS items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                item_code VARCHAR(255) UNIQUE NOT NULL,
                hs_code VARCHAR(255),
                barcode VARCHAR(255) UNIQUE,
                name VARCHAR(255) NOT NULL,
                mrp DECIMAL(10,2) NOT NULL,
                purchase_rate DECIMAL(10,2) NOT NULL,
                unit_price DECIMAL(10,2) NOT NULL,
                gst_percent DECIMAL(5,2) NOT NULL,
                gst_applicable BOOLEAN DEFAULT FALSE,
                stock_count INT DEFAULT 0,
                discount DECIMAL(5,2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )",
            
            "CREATE TABLE IF NOT EXISTS bills (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_name VARCHAR(255) NOT NULL,
                date DATE DEFAULT (CURRENT_DATE),
                items JSON,
                subtotal DECIMAL(10,2),
                total_gst DECIMAL(10,2),
                total_amount DECIMAL(10,2),
                received_amount DECIMAL(10,2) DEFAULT 0,
                balance_amount DECIMAL(10,2) DEFAULT 0,
                payment_mode ENUM('Cash', 'Paytm', 'UPI', 'Card', 'credit') DEFAULT 'Cash',
                is_credit BOOLEAN DEFAULT FALSE,
                is_paid BOOLEAN DEFAULT TRUE,
                paid_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )",
            
            "CREATE TABLE IF NOT EXISTS purchases (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type VARCHAR(255),
                `group` VARCHAR(255),
                brand VARCHAR(255),
                item_code VARCHAR(255),
                product_name VARCHAR(255),
                unit VARCHAR(255),
                opening_stock FLOAT,
                opening_stock_value FLOAT,
                purchase_price FLOAT,
                sale_price FLOAT,
                min_sale_price FLOAT,
                mrp FLOAT,
                hsn_sac VARCHAR(255),
                gst_rate FLOAT,
                sale_discount FLOAT,
                reorder_level FLOAT,
                production_date VARCHAR(255),
                expiry_date VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )",
            
            "CREATE TABLE IF NOT EXISTS purchase_invoices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                invoice_number VARCHAR(255) NOT NULL,
                supplier_name VARCHAR(255) NOT NULL,
                purchase_date DATE NOT NULL,
                total_amount FLOAT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )"
        ];

        foreach ($tables as $table) {
            $this->connection->exec($table);
        }
    }
}