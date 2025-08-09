<?php

namespace App\Models;

use App\Config\Database;
use PDO;

class Product
{
    private $db;
    private $table = 'items';
    private $dataFile;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
        $this->dataFile = __DIR__ . '/../../data/products.json';
        $this->ensureDataFile();
    }

    private function ensureDataFile()
    {
        $dataDir = dirname($this->dataFile);
        if (!is_dir($dataDir)) {
            mkdir($dataDir, 0777, true);
        }
        if (!file_exists($this->dataFile)) {
            file_put_contents($this->dataFile, json_encode([]));
        }
    }

    private function loadData()
    {
        $data = file_get_contents($this->dataFile);
        return json_decode($data, true) ?: [];
    }

    private function saveData($data)
    {
        file_put_contents($this->dataFile, json_encode($data, JSON_PRETTY_PRINT));
    }

    public function create($data)
    {
        // Map frontend camelCase to database snake_case
        $mappedData = $this->mapFieldNames($data);
        
        // Load existing data
        $products = $this->loadData();
        
        // Generate new ID
        $nextId = 1;
        if (!empty($products)) {
            $ids = array_column($products, 'id');
            $nextId = max($ids) + 1;
        }
        
        // Add timestamps and ID
        $mappedData['id'] = $nextId;
        $mappedData['created_at'] = date('Y-m-d H:i:s');
        $mappedData['updated_at'] = date('Y-m-d H:i:s');
        
        // Add to products array
        $products[] = $mappedData;
        
        // Save data
        $this->saveData($products);
        
        return true;
    }

    public function findAll()
    {
        // Load data from file
        $products = $this->loadData();
        
        // Sort by created_at DESC
        usort($products, function($a, $b) {
            return strcmp($b['created_at'] ?? '', $a['created_at'] ?? '');
        });
        
        // Convert database snake_case to frontend camelCase
        return array_map([$this, 'mapDatabaseToFrontend'], $products);
    }

    public function findById($id)
    {
        $products = $this->loadData();
        foreach ($products as $product) {
            if ($product['id'] == $id) {
                return $this->mapDatabaseToFrontend($product);
            }
        }
        return false;
    }

    public function findByItemCode($itemCode)
    {
        $products = $this->loadData();
        foreach ($products as $product) {
            if (($product['item_code'] ?? '') == $itemCode) {
                return $product; // Return raw data for internal use
            }
        }
        return false;
    }

    public function update($id, $data)
    {
        // Map frontend camelCase to database snake_case
        $mappedData = $this->mapFieldNames($data);
        
        // Load data
        $products = $this->loadData();
        
        // Find and update the product
        $found = false;
        for ($i = 0; $i < count($products); $i++) {
            if ($products[$i]['id'] == $id) {
                // Keep existing id and created_at
                $mappedData['id'] = $products[$i]['id'];
                $mappedData['created_at'] = $products[$i]['created_at'];
                $mappedData['updated_at'] = date('Y-m-d H:i:s');
                
                $products[$i] = $mappedData;
                $found = true;
                break;
            }
        }
        
        if ($found) {
            $this->saveData($products);
            return true;
        }
        
        return false;
    }

    public function delete($id)
    {
        $products = $this->loadData();
        $originalCount = count($products);
        
        // Filter out the product with matching ID
        $products = array_filter($products, function($product) use ($id) {
            return $product['id'] != $id;
        });
        
        // Re-index array
        $products = array_values($products);
        
        if (count($products) < $originalCount) {
            $this->saveData($products);
            return true;
        }
        
        return false;
    }

    public function reduceStock($items)
    {
        $products = $this->loadData();
        $updated = false;

        foreach ($items as $item) {
            for ($i = 0; $i < count($products); $i++) {
                if ($products[$i]['id'] == $item['id']) {
                    $products[$i]['stock_count'] = max(0, $products[$i]['stock_count'] - $item['quantity']);
                    $products[$i]['updated_at'] = date('Y-m-d H:i:s');
                    $updated = true;
                    break;
                }
            }
        }

        if ($updated) {
            $this->saveData($products);
        }

        return true;
    }

    public function syncFromPurchase($purchaseData)
    {
        $existing = $this->findByItemCode($purchaseData['item_code']);
        
        if ($existing) {
            // Update existing product
            $updateData = [
                'name' => $purchaseData['product_name'],
                'mrp' => $purchaseData['mrp'],
                'purchase_rate' => $purchaseData['purchase_price'],
                'unit_price' => $purchaseData['sale_price'],
                'gst_percent' => $purchaseData['gst_rate'],
                'stock_count' => $purchaseData['opening_stock'],
                'discount' => $purchaseData['sale_discount']
            ];
            return $this->update($existing['id'], $updateData);
        } else {
            // Create new product
            $newData = [
                'item_code' => $purchaseData['item_code'],
                'hs_code' => $purchaseData['hsn_sac'],
                'barcode' => null,
                'name' => $purchaseData['product_name'],
                'mrp' => $purchaseData['mrp'],
                'purchase_rate' => $purchaseData['purchase_price'],
                'unit_price' => $purchaseData['sale_price'],
                'gst_percent' => $purchaseData['gst_rate'],
                'gst_applicable' => ($purchaseData['gst_rate'] > 0),
                'stock_count' => $purchaseData['opening_stock'],
                'discount' => $purchaseData['sale_discount']
            ];
            return $this->create($newData);
        }
    }

    public function mapFieldNames($data)
    {
        $fieldMap = [
            'itemCode' => 'item_code',
            'hsCode' => 'hs_code',
            'purchaseRate' => 'purchase_rate',
            'unitPrice' => 'unit_price',
            'gstPercent' => 'gst_percent',
            'gstApplicable' => 'gst_applicable',
            'stockCount' => 'stock_count',
            'saleDiscount' => 'sale_discount'
        ];

        $mappedData = [];
        foreach ($data as $key => $value) {
            $dbKey = $fieldMap[$key] ?? $key;
            $mappedData[$dbKey] = $value;
        }

        return $mappedData;
    }

    private function mapDatabaseToFrontend($data)
    {
        $reverseMap = [
            'item_code' => 'itemCode',
            'hs_code' => 'hsCode',
            'purchase_rate' => 'purchaseRate',
            'unit_price' => 'unitPrice',
            'gst_percent' => 'gstPercent',
            'gst_applicable' => 'gstApplicable',
            'stock_count' => 'stockCount',
            'sale_discount' => 'saleDiscount'
        ];

        $mappedData = [];
        foreach ($data as $key => $value) {
            $frontendKey = $reverseMap[$key] ?? $key;
            $mappedData[$frontendKey] = $value;
        }

        return $mappedData;
    }
}