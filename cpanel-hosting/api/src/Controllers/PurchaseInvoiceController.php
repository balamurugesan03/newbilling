<?php

namespace App\Controllers;

use App\Models\PurchaseInvoice;

class PurchaseInvoiceController
{
    private $invoiceModel;

    public function __construct()
    {
        $this->invoiceModel = new PurchaseInvoice();
    }

    public function add()
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            $result = $this->invoiceModel->create($input);
            
            if ($result) {
                http_response_code(201);
                echo json_encode(['message' => 'Invoice added successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to add invoice']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getAll()
    {
        try {
            $invoices = $this->invoiceModel->findAll();
            echo json_encode($invoices);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getById($id)
    {
        try {
            $invoice = $this->invoiceModel->findById($id);
            
            if ($invoice) {
                echo json_encode($invoice);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Invoice not found']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}