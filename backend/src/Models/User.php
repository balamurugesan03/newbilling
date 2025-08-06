<?php

namespace App\Models;

use App\Config\Database;
use PDO;

class User
{
    private $db;
    private $table = 'users';

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($data)
    {
        $sql = "INSERT INTO {$this->table} (username, password) VALUES (:username, :password)";
        $stmt = $this->db->prepare($sql);
        
        $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);
        
        return $stmt->execute([
            'username' => $data['username'],
            'password' => $hashedPassword
        ]);
    }

    public function findByUsername($username)
    {
        $sql = "SELECT * FROM {$this->table} WHERE username = :username";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['username' => $username]);
        return $stmt->fetch();
    }

    public function findById($id)
    {
        $sql = "SELECT * FROM {$this->table} WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function verifyPassword($password, $hashedPassword)
    {
        return password_verify($password, $hashedPassword);
    }

    public function createDefaultAdmin()
    {
        $admin = $this->findByUsername('admin');
        if (!$admin) {
            $this->create([
                'username' => 'admin',
                'password' => 'admin123'
            ]);
            return true;
        }
        return false;
    }
}