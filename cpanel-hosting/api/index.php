<?php

require_once __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;
use App\Core\Router;
use App\Controllers\AuthController;
use App\Controllers\ProductController;
use App\Controllers\BillController;
use App\Controllers\DashboardController;
use App\Controllers\BillHistoryController;
use App\Controllers\YearlyReportController;
use App\Controllers\PurchaseController;
use App\Controllers\PurchaseInvoiceController;
use App\Middleware\AuthMiddleware;
use App\Utils\JWT;
use App\Models\User;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Initialize JWT
JWT::init();

// Start session
session_start();

// Set CORS headers for production frontend
$allowedOrigins = [
    'https://billing1.delightregister.online',
    'http://localhost:3000', // For development
    'http://localhost:5173'  // For Vite dev server
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: https://billing1.delightregister.online');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Create default admin user
$userModel = new User();
$userModel->createDefaultAdmin();

// Initialize router
$router = new Router();

// Auth routes
$router->post('/api/auth/register', [AuthController::class, 'register']);
$router->post('/api/auth/login', [AuthController::class, 'login']);

// Product routes
$router->post('/api/products', [ProductController::class, 'create']);
$router->get('/api/products', [ProductController::class, 'getAll']);
$router->put('/api/products/{id}', [ProductController::class, 'update']);
$router->delete('/api/products/{id}', [ProductController::class, 'delete']);
$router->post('/api/products/reduce-stock', [ProductController::class, 'reduceStock']);

// Bill routes
$router->post('/api/bills', [BillController::class, 'create']);
$router->get('/api/bills', [BillController::class, 'getAll']);
$router->get('/api/bills/credit-report', [BillController::class, 'getCreditReport']);
$router->post('/api/bills/mark-paid/{id}', [BillController::class, 'markPaid']);

// Dashboard routes
$router->get('/api/dashboard/today', [DashboardController::class, 'getTodayDashboard']);
$router->get('/api/dashboard/debug', [DashboardController::class, 'getDebugInfo']);

// Bill history routes
$router->get('/api/bill-history', [BillHistoryController::class, 'getByDateRange']);

// Yearly report routes
$router->get('/api/yearly-report', [YearlyReportController::class, 'getYearlyReport']);

// Purchase routes
$router->post('/api/purchases/add', [PurchaseController::class, 'add']);
$router->get('/api/purchases', [PurchaseController::class, 'getAll']);
$router->put('/api/purchases/{id}', [PurchaseController::class, 'update']);
$router->delete('/api/purchases/{id}', [PurchaseController::class, 'delete']);
$router->post('/api/purchases/sync-products', [PurchaseController::class, 'syncProducts']);
$router->get('/api/purchases/report/daily', [PurchaseController::class, 'getDailyReport']);
$router->get('/api/purchases/report/range', [PurchaseController::class, 'getRangeReport']);
$router->get('/api/purchases/report/monthly', [PurchaseController::class, 'getMonthlyReport']);

// Purchase invoice routes
$router->post('/api/invoices/add', [PurchaseInvoiceController::class, 'add']);
$router->get('/api/invoices', [PurchaseInvoiceController::class, 'getAll']);
$router->get('/api/invoices/{id}', [PurchaseInvoiceController::class, 'getById']);

// Handle the request
try {
    $router->handle();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}