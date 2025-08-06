<?php

namespace App\Controllers;

use App\Models\Bill;

class YearlyReportController
{
    private $billModel;

    public function __construct()
    {
        $this->billModel = new Bill();
    }

    public function getYearlyReport()
    {
        try {
            $year = $_GET['year'] ?? date('Y');
            
            $salesData = $this->billModel->getYearlySales($year);
            
            // Format data for chart display
            $monthlyData = [];
            for ($i = 1; $i <= 12; $i++) {
                $monthData = array_filter($salesData, function($item) use ($i) {
                    return $item['month'] == $i;
                });
                
                if (!empty($monthData)) {
                    $monthData = array_values($monthData)[0];
                    $monthlyData[] = [
                        'month' => $i,
                        'monthName' => date('F', mktime(0, 0, 0, $i, 1)),
                        'totalSales' => $monthData['total_sales'],
                        'totalBills' => $monthData['total_bills']
                    ];
                } else {
                    $monthlyData[] = [
                        'month' => $i,
                        'monthName' => date('F', mktime(0, 0, 0, $i, 1)),
                        'totalSales' => 0,
                        'totalBills' => 0
                    ];
                }
            }
            
            echo json_encode([
                'year' => $year,
                'data' => $monthlyData,
                'totalYearlySales' => array_sum(array_column($monthlyData, 'totalSales')),
                'totalYearlyBills' => array_sum(array_column($monthlyData, 'totalBills'))
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}