<?php

namespace App\Config;

use PDO;
use PDOException;

class Database
{
    private static $instance = null;
    private $connection;

    private function __construct()
    {
        // File-based storage for development - no database drivers needed
        $this->connection = null;
        $this->createTables();
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection()
    {
        return $this;
    }

    private function createTables()
    {
        // Create data directory if it doesn't exist
        $dataDir = __DIR__ . '/../../data';
        if (!is_dir($dataDir)) {
            mkdir($dataDir, 0777, true);
        }
    }

    public function query($sql)
    {
        // Mock query method - returns empty array for SELECT queries
        return new MockStatement([]);
    }

    public function prepare($sql)
    {
        return new MockStatement([]);
    }

    public function exec($sql)
    {
        return true;
    }
}

class MockStatement
{
    private $data;

    public function __construct($data = [])
    {
        $this->data = $data;
    }

    public function execute($params = [])
    {
        return true;
    }

    public function fetchAll()
    {
        return $this->data;
    }

    public function fetch()
    {
        return $this->data[0] ?? false;
    }
}