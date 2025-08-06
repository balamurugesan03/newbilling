<?php

namespace App\Models;

use App\Config\Database;
use PDO;

class Product
{
    private $db;
    private $table = 'items';

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($data)
    {
        $sql = "INSERT INTO {$this->table} (
            item_code, hs_code, barcode, name, mrp, purchase_rate, 
            unit_price, gst_percent, gst_applicable, stock_count, discount
        ) VALUES (
            :item_code, :hs_code, :barcode, :name, :mrp, :purchase_rate,
            :unit_price, :gst_percent, :gst_applicable, :stock_count, :discount
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

    public function findByItemCode($itemCode)
    {
        $sql = "SELECT * FROM {$this->table} WHERE item_code = :item_code";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['item_code' => $itemCode]);
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

    public function reduceStock($items)
    {
        foreach ($items as $item) {
            $sql = "UPDATE {$this->table} SET stock_count = stock_count - :quantity WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'quantity' => $item['quantity'],
                'id' => $item['id']
            ]);
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
}