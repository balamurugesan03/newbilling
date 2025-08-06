<?php

namespace App\Controllers;

use App\Models\Purchase;
use App\Models\Product;

class PurchaseController
{
    private $purchaseModel;
    private $productModel;

    public function __construct()
    {
        $this->purchaseModel = new Purchase();
        $this->productModel = new Product();
    }

    public function add()
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            $result = $this->purchaseModel->create($input);
            
            if ($result) {
                // Auto-sync with products table
                $this->productModel->syncFromPurchase($input);
                
                http_response_code(201);
                echo json_encode(['message' => 'Purchase added successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to add purchase']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getAll()
    {
        try {
            $purchases = $this->purchaseModel->findAll();
            echo json_encode($purchases);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function update($id)
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            $result = $this->purchaseModel->update($id, $input);
            
            if ($result) {
                // Re-sync with products table
                $this->productModel->syncFromPurchase($input);
                
                echo json_encode(['message' => 'Purchase updated successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Purchase not found']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function delete($id)
    {
        try {
            $result = $this->purchaseModel->delete($id);
            
            if ($result) {
                echo json_encode(['message' => 'Purchase deleted successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Purchase not found']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function syncProducts()
    {
        try {
            $purchases = $this->purchaseModel->findAll();
            $syncCount = 0;
            
            foreach ($purchases as $purchase) {
                $this->productModel->syncFromPurchase($purchase);
                $syncCount++;
            }
            
            echo json_encode([
                'message' => 'Products synced successfully',
                'syncedCount' => $syncCount
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getDailyReport()
    {
        try {
            $date = $_GET['date'] ?? date('Y-m-d');
            
            $report = $this->purchaseModel->getDailyReport($date);
            echo json_encode($report);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getRangeReport()
    {
        try {
            $startDate = $_GET['start'] ?? date('Y-m-d');
            $endDate = $_GET['end'] ?? date('Y-m-d');
            
            $report = $this->purchaseModel->getRangeReport($startDate, $endDate);
            echo json_encode($report);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getMonthlyReport()
    {
        try {
            $month = $_GET['month'] ?? date('n');
            $year = $_GET['year'] ?? date('Y');
            
            $report = $this->purchaseModel->getMonthlyReport($month, $year);
            echo json_encode($report);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}