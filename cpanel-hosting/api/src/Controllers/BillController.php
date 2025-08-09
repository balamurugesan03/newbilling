<?php

namespace App\Controllers;

use App\Models\Bill;
use App\Models\Product;

class BillController
{
    private $billModel;
    private $productModel;

    public function __construct()
    {
        $this->billModel = new Bill();
        $this->productModel = new Product();
    }

    public function create()
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Calculate totals
            $subtotal = 0;
            $totalGST = 0;
            
            foreach ($input['items'] as $item) {
                $itemTotal = $item['quantity'] * $item['unitPrice'];
                $subtotal += $itemTotal;
                
                if ($item['gstApplicable']) {
                    $gstAmount = ($itemTotal * $item['gstPercent']) / 100;
                    $totalGST += $gstAmount;
                }
            }
            
            $totalAmount = $subtotal + $totalGST;
            $receivedAmount = $input['receivedAmount'] ?? $totalAmount;
            $balanceAmount = $totalAmount - $receivedAmount;
            
            $billData = [
                'customer_name' => $input['customerName'],
                'date' => $input['date'] ?? date('Y-m-d'),
                'items' => $input['items'],
                'subtotal' => $subtotal,
                'total_gst' => $totalGST,
                'total_amount' => $totalAmount,
                'received_amount' => $receivedAmount,
                'balance_amount' => $balanceAmount,
                'payment_mode' => $input['paymentMode'] ?? 'Cash',
                'is_credit' => $balanceAmount > 0,
                'is_paid' => $balanceAmount <= 0
            ];
            
            $result = $this->billModel->create($billData);
            
            if ($result) {
                // Reduce stock for each item - map productId to id for reduceStock method
                $stockItems = array_map(function($item) {
                    return [
                        'id' => $item['productId'],
                        'quantity' => $item['quantity']
                    ];
                }, $input['items']);
                $this->productModel->reduceStock($stockItems);
                
                http_response_code(201);
                echo json_encode(['message' => 'Bill created successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create bill']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getAll()
    {
        try {
            $bills = $this->billModel->findAll();
            echo json_encode($bills);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getCreditReport()
    {
        try {
            $month = $_GET['month'] ?? date('n');
            $year = $_GET['year'] ?? date('Y');
            
            $creditBills = $this->billModel->getCreditReport($month, $year);
            echo json_encode($creditBills);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function markPaid($id)
    {
        try {
            $result = $this->billModel->markAsPaid($id);
            
            if ($result) {
                echo json_encode(['message' => 'Bill marked as paid']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Bill not found']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}