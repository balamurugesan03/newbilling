<?php

namespace App\Models;

use App\Config\Database;
use PDO;

class Purchase
{
    private $db;
    private $table = 'purchases';
    private $dataFile;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
        $this->dataFile = __DIR__ . '/../../data/purchases.json';
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
        $purchases = $this->loadData();
        
        // Check for duplicate item_code (optional validation)
        if (!empty($mappedData['item_code'])) {
            $existingCodes = array_column($purchases, 'item_code');
            if (in_array($mappedData['item_code'], $existingCodes)) {
                // Allow duplicates but log a warning (you could make this stricter if needed)
                error_log("Warning: Duplicate item_code '{$mappedData['item_code']}' being added");
            }
        }
        
        // Generate new ID
        $nextId = 1;
        if (!empty($purchases)) {
            $ids = array_column($purchases, 'id');
            $nextId = max($ids) + 1;
        }
        
        // Add timestamps and ID
        $mappedData['id'] = $nextId;
        $mappedData['created_at'] = date('Y-m-d H:i:s');
        $mappedData['updated_at'] = date('Y-m-d H:i:s');
        
        // Add to purchases array
        $purchases[] = $mappedData;
        
        // Save data
        $this->saveData($purchases);
        
        return true;
    }

    public function findAll()
    {
        // Load data from file
        $purchases = $this->loadData();
        
        // Sort by created_at DESC
        usort($purchases, function($a, $b) {
            return strcmp($b['created_at'] ?? '', $a['created_at'] ?? '');
        });
        
        // Convert database snake_case to frontend camelCase
        return array_map([$this, 'mapDatabaseToFrontend'], $purchases);
    }

    public function findById($id)
    {
        $purchases = $this->loadData();
        foreach ($purchases as $purchase) {
            if ($purchase['id'] == $id) {
                return $this->mapDatabaseToFrontend($purchase);
            }
        }
        return false;
    }

    public function update($id, $data)
    {
        // Map frontend camelCase to database snake_case
        $mappedData = $this->mapFieldNames($data);
        
        // Load data
        $purchases = $this->loadData();
        
        // Find and update the purchase
        $found = false;
        for ($i = 0; $i < count($purchases); $i++) {
            if ($purchases[$i]['id'] == $id) {
                // Keep existing id and created_at
                $mappedData['id'] = $purchases[$i]['id'];
                $mappedData['created_at'] = $purchases[$i]['created_at'];
                $mappedData['updated_at'] = date('Y-m-d H:i:s');
                
                $purchases[$i] = $mappedData;
                $found = true;
                break;
            }
        }
        
        if ($found) {
            $this->saveData($purchases);
            return true;
        }
        
        return false;
    }

    public function mapFieldNames($data)
    {
        $fieldMap = [
            'itemCode' => 'item_code',
            'productName' => 'product_name',
            'openingStock' => 'opening_stock',
            'openingStockValue' => 'opening_stock_value',
            'purchasePrice' => 'purchase_price',
            'salePrice' => 'sale_price',
            'minSalePrice' => 'min_sale_price',
            'hsnSac' => 'hsn_sac',
            'gstRate' => 'gst_rate',
            'saleDiscount' => 'sale_discount',
            'reorderLevel' => 'reorder_level',
            'productionDate' => 'production_date',
            'expiryDate' => 'expiry_date'
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
            'product_name' => 'productName',
            'opening_stock' => 'openingStock',
            'opening_stock_value' => 'openingStockValue',
            'purchase_price' => 'purchasePrice',
            'sale_price' => 'salePrice',
            'min_sale_price' => 'minSalePrice',
            'hsn_sac' => 'hsnSac',
            'gst_rate' => 'gstRate',
            'sale_discount' => 'saleDiscount',
            'reorder_level' => 'reorderLevel',
            'production_date' => 'productionDate',
            'expiry_date' => 'expiryDate'
        ];

        $mappedData = [];
        foreach ($data as $key => $value) {
            $frontendKey = $reverseMap[$key] ?? $key;
            $mappedData[$frontendKey] = $value;
        }

        return $mappedData;
    }

    public function delete($id)
    {
        $purchases = $this->loadData();
        $originalCount = count($purchases);
        
        // Filter out the purchase with matching ID
        $purchases = array_filter($purchases, function($purchase) use ($id) {
            return $purchase['id'] != $id;
        });
        
        // Re-index array
        $purchases = array_values($purchases);
        
        if (count($purchases) < $originalCount) {
            $this->saveData($purchases);
            return true;
        }
        
        return false;
    }

    public function getDailyReport($date)
    {
        $purchases = $this->loadData();
        $filteredPurchases = array_filter($purchases, function($purchase) use ($date) {
            return substr($purchase['created_at'] ?? '', 0, 10) === $date;
        });

        // Calculate totals
        $totalPurchases = count($filteredPurchases);
        $totalValue = 0;
        $totalStock = 0;
        $categoryStats = [];

        foreach ($filteredPurchases as $purchase) {
            $totalValue += ($purchase['opening_stock'] ?? 0) * ($purchase['purchase_price'] ?? 0);
            $totalStock += $purchase['opening_stock'] ?? 0;
            
            // Group by type for category stats
            $type = $purchase['type'] ?? 'Unknown';
            if (!isset($categoryStats[$type])) {
                $categoryStats[$type] = [
                    'count' => 0,
                    'totalValue' => 0,
                    'totalStock' => 0
                ];
            }
            $categoryStats[$type]['count']++;
            $categoryStats[$type]['totalValue'] += ($purchase['opening_stock'] ?? 0) * ($purchase['purchase_price'] ?? 0);
            $categoryStats[$type]['totalStock'] += $purchase['opening_stock'] ?? 0;
        }

        return [
            'purchases' => array_map([$this, 'mapDatabaseToFrontend'], array_values($filteredPurchases)),
            'totals' => [
                'totalPurchases' => $totalPurchases,
                'totalValue' => $totalValue,
                'totalStock' => $totalStock,
                'averageValue' => $totalPurchases > 0 ? $totalValue / $totalPurchases : 0
            ],
            'categoryStats' => $categoryStats
        ];
    }

    public function getRangeReport($startDate, $endDate)
    {
        $purchases = $this->loadData();
        $filteredPurchases = array_filter($purchases, function($purchase) use ($startDate, $endDate) {
            $createdDate = substr($purchase['created_at'] ?? '', 0, 10);
            return $createdDate >= $startDate && $createdDate <= $endDate;
        });

        // Group by date for daily breakdown
        $dailyReport = [];
        $allPurchases = [];

        foreach ($filteredPurchases as $purchase) {
            $date = substr($purchase['created_at'] ?? '', 0, 10);
            
            if (!isset($dailyReport[$date])) {
                $dailyReport[$date] = [
                    'date' => $date,
                    'count' => 0,
                    'totalValue' => 0,
                    'totalStock' => 0
                ];
            }
            
            $dailyReport[$date]['count']++;
            $dailyReport[$date]['totalValue'] += ($purchase['opening_stock'] ?? 0) * ($purchase['purchase_price'] ?? 0);
            $dailyReport[$date]['totalStock'] += $purchase['opening_stock'] ?? 0;
            
            $allPurchases[] = $this->mapDatabaseToFrontend($purchase);
        }

        return [
            'dailyReport' => array_values($dailyReport),
            'allPurchases' => $allPurchases,
            'summary' => [
                'totalDays' => count($dailyReport),
                'totalPurchases' => count($filteredPurchases),
                'totalValue' => array_sum(array_column($dailyReport, 'totalValue')),
                'totalStock' => array_sum(array_column($dailyReport, 'totalStock'))
            ]
        ];
    }

    public function getMonthlyReport($month, $year)
    {
        $purchases = $this->loadData();
        $filtered = array_filter($purchases, function($purchase) use ($month, $year) {
            if (!isset($purchase['created_at'])) return false;
            $timestamp = strtotime($purchase['created_at']);
            return date('n', $timestamp) == $month && date('Y', $timestamp) == $year;
        });

        // Calculate totals
        $totalPurchases = count($filtered);
        $totalValue = 0;
        $totalStock = 0;

        // Group by type, group, brand
        $grouped = [];
        foreach ($filtered as $purchase) {
            $totalValue += ($purchase['opening_stock'] ?? 0) * ($purchase['purchase_price'] ?? 0);
            $totalStock += $purchase['opening_stock'] ?? 0;

            $key = ($purchase['type'] ?? '') . '|' . ($purchase['group'] ?? '') . '|' . ($purchase['brand'] ?? '');
            if (!isset($grouped[$key])) {
                $grouped[$key] = [
                    'type' => $purchase['type'] ?? '',
                    'group' => $purchase['group'] ?? '',
                    'brand' => $purchase['brand'] ?? '',
                    'total_items' => 0,
                    'total_value' => 0,
                    'total_stock' => 0
                ];
            }
            $grouped[$key]['total_items']++;
            $grouped[$key]['total_value'] += ($purchase['opening_stock'] ?? 0) * ($purchase['purchase_price'] ?? 0);
            $grouped[$key]['total_stock'] += $purchase['opening_stock'] ?? 0;
        }

        return [
            'purchases' => array_map([$this, 'mapDatabaseToFrontend'], array_values($filtered)),
            'groupedData' => array_values($grouped),
            'summary' => [
                'totalPurchases' => $totalPurchases,
                'totalValue' => $totalValue,
                'totalStock' => $totalStock,
                'uniqueCategories' => count($grouped)
            ]
        ];
    }
}