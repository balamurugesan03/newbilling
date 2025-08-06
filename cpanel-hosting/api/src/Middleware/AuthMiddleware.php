<?php

namespace App\Middleware;

use App\Utils\JWT;

class AuthMiddleware
{
    public static function authenticate()
    {
        $token = JWT::getTokenFromHeader();
        
        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return false;
        }
        
        $decoded = JWT::verify($token);
        
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token']);
            return false;
        }
        
        // Store user info for use in controllers
        $_SESSION['user'] = $decoded;
        return true;
    }
}