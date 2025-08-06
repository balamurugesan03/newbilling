<?php

namespace App\Controllers;

use App\Models\Bill;

class BillHistoryController
{
    private $billModel;

    public function __construct()
    {
        $this->billModel = new Bill();
    }

    public function getByDateRange()
    {
        try {
            $startDate = $_GET['start'] ?? date('Y-m-d');
            $endDate = $_GET['end'] ?? date('Y-m-d');
            
            $bills = $this->billModel->findByDateRange($startDate, $endDate);
            echo json_encode($bills);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}