<?php

namespace App\Models;

use App\Config\Database;
use PDO;

class Purchase
{
    private $db;
    private $table = 'purchases';

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($data)
    {
        $sql = "INSERT INTO {$this->table} (
            type, `group`, brand, item_code, product_name, unit, opening_stock,
            opening_stock_value, purchase_price, sale_price, min_sale_price, mrp,
            hsn_sac, gst_rate, sale_discount, reorder_level, production_date, expiry_date
        ) VALUES (
            :type, :group, :brand, :item_code, :product_name, :unit, :opening_stock,
            :opening_stock_value, :purchase_price, :sale_price, :min_sale_price, :mrp,
            :hsn_sac, :gst_rate, :sale_discount, :reorder_level, :production_date, :expiry_date
        )";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($data);
    }

    public function findAll()
    {
        $sql = "SELECT * FROM {$this->table} ORDER BY created_at DESC";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }

    public function findById($id)
    {
        $sql = "SELECT * FROM {$this->table} WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function update($id, $data)
    {
        $fields = [];
        $values = ['id' => $id];
        
        foreach ($data as $key => $value) {
            $fields[] = "{$key} = :{$key}";
            $values[$key] = $value;
        }
        
        $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }

    public function delete($id)
    {
        $sql = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }

    public function getDailyReport($date)
    {
        $sql = "SELECT * FROM {$this->table} WHERE DATE(created_at) = :date ORDER BY created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['date' => $date]);
        return $stmt->fetchAll();
    }

    public function getRangeReport($startDate, $endDate)
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE DATE(created_at) BETWEEN :start_date AND :end_date 
                ORDER BY created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'start_date' => $startDate,
            'end_date' => $endDate
        ]);
        return $stmt->fetchAll();
    }

    public function getMonthlyReport($month, $year)
    {
        $sql = "SELECT 
                    type,
                    `group`,
                    brand,
                    COUNT(*) as total_items,
                    SUM(opening_stock * purchase_price) as total_value,
                    SUM(opening_stock) as total_stock
                FROM {$this->table} 
                WHERE MONTH(created_at) = :month AND YEAR(created_at) = :year
                GROUP BY type, `group`, brand
                ORDER BY total_value DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['month' => $month, 'year' => $year]);
        return $stmt->fetchAll();
    }
}