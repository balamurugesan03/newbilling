<?php

namespace App\Controllers;

use App\Models\Product;

class ProductController
{
    private $productModel;

    public function __construct()
    {
        $this->productModel = new Product();
    }

    public function create()
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            $result = $this->productModel->create($input);
            
            if ($result) {
                http_response_code(201);
                echo json_encode(['message' => 'Product created successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create product']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getAll()
    {
        try {
            $products = $this->productModel->findAll();
            echo json_encode($products);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function update($id)
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            $result = $this->productModel->update($id, $input);
            
            if ($result) {
                echo json_encode(['message' => 'Product updated successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Product not found']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function delete($id)
    {
        try {
            $result = $this->productModel->delete($id);
            
            if ($result) {
                echo json_encode(['message' => 'Product deleted successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Product not found']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function reduceStock()
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            $result = $this->productModel->reduceStock($input['items']);
            
            if ($result) {
                echo json_encode(['message' => 'Stock reduced successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to reduce stock']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}