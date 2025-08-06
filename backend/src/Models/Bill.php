<?php

namespace App\Models;

use App\Config\Database;
use PDO;

class Bill
{
    private $db;
    private $table = 'bills';

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($data)
    {
        $sql = "INSERT INTO {$this->table} (
            customer_name, date, items, subtotal, total_gst, total_amount,
            received_amount, balance_amount, payment_mode, is_credit, is_paid
        ) VALUES (
            :customer_name, :date, :items, :subtotal, :total_gst, :total_amount,
            :received_amount, :balance_amount, :payment_mode, :is_credit, :is_paid
        )";
        
        $stmt = $this->db->prepare($sql);
        
        // Convert items array to JSON
        $data['items'] = json_encode($data['items']);
        $data['is_credit'] = $data['is_credit'] ? 1 : 0;
        $data['is_paid'] = $data['is_paid'] ? 1 : 0;
        
        return $stmt->execute($data);
    }

    public function findAll()
    {
        $sql = "SELECT * FROM {$this->table} ORDER BY created_at DESC";
        $stmt = $this->db->query($sql);
        $bills = $stmt->fetchAll();
        
        // Parse JSON items
        foreach ($bills as &$bill) {
            $bill['items'] = json_decode($bill['items'], true);
        }
        
        return $bills;
    }

    public function findById($id)
    {
        $sql = "SELECT * FROM {$this->table} WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $bill = $stmt->fetch();
        
        if ($bill) {
            $bill['items'] = json_decode($bill['items'], true);
        }
        
        return $bill;
    }

    public function findByDateRange($startDate, $endDate)
    {
        $sql = "SELECT * FROM {$this->table} WHERE date BETWEEN :start_date AND :end_date ORDER BY created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'start_date' => $startDate,
            'end_date' => $endDate
        ]);
        
        $bills = $stmt->fetchAll();
        
        // Parse JSON items
        foreach ($bills as &$bill) {
            $bill['items'] = json_decode($bill['items'], true);
        }
        
        return $bills;
    }

    public function getCreditReport($month, $year)
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE MONTH(date) = :month AND YEAR(date) = :year AND is_paid = 0
                ORDER BY created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['month' => $month, 'year' => $year]);
        
        $bills = $stmt->fetchAll();
        
        // Parse JSON items
        foreach ($bills as &$bill) {
            $bill['items'] = json_decode($bill['items'], true);
        }
        
        return $bills;
    }

    public function markAsPaid($id)
    {
        $sql = "UPDATE {$this->table} SET is_paid = 1, paid_date = CURRENT_DATE WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }

    public function getTodaysSales()
    {
        $sql = "SELECT 
                    COUNT(*) as total_bills,
                    SUM(total_amount) as total_sales,
                    SUM(CASE WHEN is_credit = 1 THEN total_amount ELSE 0 END) as credit_sales,
                    SUM(CASE WHEN is_credit = 0 THEN total_amount ELSE 0 END) as cash_sales
                FROM {$this->table} 
                WHERE DATE(created_at) = CURRENT_DATE";
        
        $stmt = $this->db->query($sql);
        return $stmt->fetch();
    }

    public function getYearlySales($year)
    {
        $sql = "SELECT 
                    MONTH(date) as month,
                    SUM(total_amount) as total_sales,
                    COUNT(*) as total_bills
                FROM {$this->table} 
                WHERE YEAR(date) = :year
                GROUP BY MONTH(date)
                ORDER BY month";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['year' => $year]);
        return $stmt->fetchAll();
    }
}