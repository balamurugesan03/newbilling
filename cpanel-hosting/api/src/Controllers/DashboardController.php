<?php

namespace App\Controllers;

use App\Models\Bill;
use App\Models\Product;

class DashboardController
{
    private $billModel;
    private $productModel;

    public function __construct()
    {
        $this->billModel = new Bill();
        $this->productModel = new Product();
    }

    public function getTodayDashboard()
    {
        try {
            $salesData = $this->billModel->getTodaysSales();
            $products = $this->productModel->findAll();
            
            // Calculate stock statistics
            $totalProducts = count($products);
            $totalStock = array_sum(array_column($products, 'stock_count'));
            $lowStockItems = array_filter($products, function($product) {
                return $product['stock_count'] < 10; // Assuming 10 is low stock threshold
            });
            
            $dashboard = [
                'totalSales' => $salesData['total_sales'] ?? 0,
                'totalBills' => $salesData['total_bills'] ?? 0,
                'creditSales' => $salesData['credit_sales'] ?? 0,
                'cashSales' => $salesData['cash_sales'] ?? 0,
                'totalProducts' => $totalProducts,
                'totalStock' => $totalStock,
                'lowStockCount' => count($lowStockItems),
                'lowStockItems' => $lowStockItems
            ];
            
            echo json_encode($dashboard);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getDebugInfo()
    {
        try {
            $salesData = $this->billModel->getTodaysSales();
            $todaysBills = $this->billModel->findByDateRange(date('Y-m-d'), date('Y-m-d'));
            
            $debug = [
                'todaysDate' => date('Y-m-d'),
                'salesData' => $salesData,
                'billsCount' => count($todaysBills),
                'billsPreview' => array_slice($todaysBills, 0, 3) // First 3 bills
            ];
            
            echo json_encode($debug);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}