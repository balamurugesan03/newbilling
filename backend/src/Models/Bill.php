<?php

namespace App\Models;

use App\Config\Database;
use PDO;

class Bill
{
    private $db;
    private $table = 'bills';
    private $dataFile;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
        $this->dataFile = __DIR__ . '/../../data/bills.json';
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
        // Load existing data
        $bills = $this->loadData();
        
        // Generate new ID
        $nextId = 1;
        if (!empty($bills)) {
            $ids = array_column($bills, 'id');
            $nextId = max($ids) + 1;
        }
        
        // Prepare bill data
        $billData = [
            'id' => $nextId,
            'customer_name' => $data['customer_name'],
            'date' => $data['date'],
            'items' => $data['items'], // Keep as array, no need to JSON encode for file storage
            'subtotal' => $data['subtotal'],
            'total_gst' => $data['total_gst'],
            'total_amount' => $data['total_amount'],
            'received_amount' => $data['received_amount'],
            'balance_amount' => $data['balance_amount'],
            'payment_mode' => $data['payment_mode'],
            'is_credit' => $data['is_credit'] ? 1 : 0,
            'is_paid' => $data['is_paid'] ? 1 : 0,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        // Add to bills array
        $bills[] = $billData;
        
        // Save data
        $this->saveData($bills);
        
        return true;
    }

    public function findAll()
    {
        // Load data from file
        $bills = $this->loadData();
        
        // Sort by created_at DESC
        usort($bills, function($a, $b) {
            return strcmp($b['created_at'] ?? '', $a['created_at'] ?? '');
        });
        
        return $bills;
    }

    public function findById($id)
    {
        $bills = $this->loadData();
        foreach ($bills as $bill) {
            if ($bill['id'] == $id) {
                return $bill;
            }
        }
        return false;
    }

    public function findByDateRange($startDate, $endDate)
    {
        $bills = $this->loadData();
        $filteredBills = array_filter($bills, function($bill) use ($startDate, $endDate) {
            $billDate = $bill['date'] ?? '';
            return $billDate >= $startDate && $billDate <= $endDate;
        });
        
        // Sort by created_at DESC
        usort($filteredBills, function($a, $b) {
            return strcmp($b['created_at'] ?? '', $a['created_at'] ?? '');
        });
        
        return array_values($filteredBills);
    }

    public function getCreditReport($month, $year)
    {
        $bills = $this->loadData();
        $creditBills = array_filter($bills, function($bill) use ($month, $year) {
            if ($bill['is_paid'] != 0) return false;
            
            $billDate = $bill['date'] ?? '';
            if (!$billDate) return false;
            
            $timestamp = strtotime($billDate);
            return date('n', $timestamp) == $month && date('Y', $timestamp) == $year;
        });
        
        // Sort by created_at DESC
        usort($creditBills, function($a, $b) {
            return strcmp($b['created_at'] ?? '', $a['created_at'] ?? '');
        });
        
        return array_values($creditBills);
    }

    public function markAsPaid($id)
    {
        $bills = $this->loadData();
        $found = false;
        
        for ($i = 0; $i < count($bills); $i++) {
            if ($bills[$i]['id'] == $id) {
                $bills[$i]['is_paid'] = 1;
                $bills[$i]['paid_date'] = date('Y-m-d');
                $bills[$i]['updated_at'] = date('Y-m-d H:i:s');
                $found = true;
                break;
            }
        }
        
        if ($found) {
            $this->saveData($bills);
            return true;
        }
        
        return false;
    }

    public function getTodaysSales()
    {
        $bills = $this->loadData();
        $today = date('Y-m-d');
        
        $todaysBills = array_filter($bills, function($bill) use ($today) {
            return substr($bill['created_at'] ?? '', 0, 10) === $today;
        });
        
        $totalBills = count($todaysBills);
        $totalSales = array_sum(array_column($todaysBills, 'total_amount'));
        $creditSales = 0;
        $cashSales = 0;
        
        foreach ($todaysBills as $bill) {
            if ($bill['is_credit']) {
                $creditSales += $bill['total_amount'];
            } else {
                $cashSales += $bill['total_amount'];
            }
        }
        
        return [
            'total_bills' => $totalBills,
            'total_sales' => $totalSales,
            'credit_sales' => $creditSales,
            'cash_sales' => $cashSales
        ];
    }

    public function getYearlySales($year)
    {
        $bills = $this->loadData();
        $monthlyData = [];
        
        // Initialize all months
        for ($i = 1; $i <= 12; $i++) {
            $monthlyData[$i] = [
                'month' => $i,
                'total_sales' => 0,
                'total_bills' => 0
            ];
        }
        
        // Process bills for the year
        foreach ($bills as $bill) {
            $billDate = $bill['date'] ?? '';
            if (!$billDate) continue;
            
            $timestamp = strtotime($billDate);
            if (date('Y', $timestamp) == $year) {
                $month = (int)date('n', $timestamp);
                $monthlyData[$month]['total_sales'] += $bill['total_amount'] ?? 0;
                $monthlyData[$month]['total_bills']++;
            }
        }
        
        return array_values($monthlyData);
    }
}