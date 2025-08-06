<?php

require_once __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;
use App\Models\User;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Create default admin user
$userModel = new User();
$result = $userModel->createDefaultAdmin();

if ($result) {
    echo "✅ Default admin created: admin / admin123\n";
} else {
    echo "ℹ️  Default admin already exists\n";
}