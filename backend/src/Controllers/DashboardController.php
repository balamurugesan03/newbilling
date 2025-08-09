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
            
            // Get today's bills for detailed calculations
            $todaysBills = $this->billModel->findByDateRange(date('Y-m-d'), date('Y-m-d'));
            
            // Calculate GST and non-GST totals
            $totalWithGST = 0;
            $totalWithoutGST = 0;
            $totalGST = 0;
            $monthlyWithGST = 0;
            $monthlyWithoutGST = 0;
            $monthlyGST = 0;
            
            // Today's calculations
            foreach ($todaysBills as $bill) {
                $totalWithGST += $bill['total_amount'] ?? 0;
                $totalWithoutGST += $bill['subtotal'] ?? 0;
                $totalGST += $bill['total_gst'] ?? 0;
            }
            
            // Monthly calculations
            $firstOfMonth = date('Y-m-01');
            $lastOfMonth = date('Y-m-t');
            $monthlyBills = $this->billModel->findByDateRange($firstOfMonth, $lastOfMonth);
            
            foreach ($monthlyBills as $bill) {
                $monthlyWithGST += $bill['total_amount'] ?? 0;
                $monthlyWithoutGST += $bill['subtotal'] ?? 0;
                $monthlyGST += $bill['total_gst'] ?? 0;
            }
            
            // Calculate stock statistics
            $totalProducts = count($products);
            $totalStock = 0;
            $lowStockItems = [];
            
            foreach ($products as $product) {
                $stockCount = $product['stockCount'] ?? 0;
                $totalStock += $stockCount;
                
                if ($stockCount < 10) {
                    $lowStockItems[] = $product;
                }
            }
            
            $dashboard = [
                // Today's data
                'totalSales' => $totalWithGST,
                'totalWithoutGST' => $totalWithoutGST,
                'totalGST' => $totalGST,
                'totalBills' => $salesData['total_bills'] ?? 0,
                'creditSales' => $salesData['credit_sales'] ?? 0,
                'cashSales' => $salesData['cash_sales'] ?? 0,
                
                // Monthly data
                'monthlySales' => $monthlyWithGST,
                'monthlyWithoutGST' => $monthlyWithoutGST,
                'monthlyGST' => $monthlyGST,
                
                // Stock data
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