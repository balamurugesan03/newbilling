<?php
// Simple test file to verify server setup
echo "<h1>✅ Server Test - billing1.delightregister.online</h1>";
echo "<p><strong>Current Date/Time:</strong> " . date('Y-m-d H:i:s') . "</p>";
echo "<p><strong>Server Path:</strong> " . __DIR__ . "</p>";
echo "<p><strong>PHP Version:</strong> " . phpversion() . "</p>";

// Test database connection
echo "<h2>Database Connection Test</h2>";
try {
    $host = 'localhost';
    $port = 3306;
    $database = 'delightregister_bill1';
    $username = 'delightregister_biller1';
    $password = '=nFM,lEyhPPc!4WF';
    
    $dsn = "mysql:host=$host;port=$port;dbname=$database;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<p style='color: green;'>✅ <strong>Database Connection: SUCCESS</strong></p>";
    echo "<p>Database: $database</p>";
    echo "<p>User: $username</p>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ <strong>Database Connection: FAILED</strong></p>";
    echo "<p>Error: " . $e->getMessage() . "</p>";
}

// Test file structure
echo "<h2>File Structure Check</h2>";
$files = ['index.html', 'api/index.php', 'api/.env', 'api/.htaccess'];
foreach ($files as $file) {
    if (file_exists($file)) {
        echo "<p style='color: green;'>✅ $file exists</p>";
    } else {
        echo "<p style='color: red;'>❌ $file missing</p>";
    }
}

echo "<h2>Next Steps</h2>";
echo "<ul>";
echo "<li>If you see this page, your server is working</li>";
echo "<li>If database connection succeeded, your credentials are correct</li>";
echo "<li>If files exist, try accessing: <a href='index.html'>index.html</a></li>";
echo "<li>Try the API: <a href='api/dashboard/today'>API Test</a></li>";
echo "</ul>";

echo "<p><small>Delete this test.php file after testing</small></p>";
?>