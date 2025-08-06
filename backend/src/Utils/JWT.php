<?php

namespace App\Utils;

use Firebase\JWT\JWT as FirebaseJWT;
use Firebase\JWT\Key;

class JWT
{
    private static $secret;

    public static function init()
    {
        self::$secret = $_ENV['JWT_SECRET'] ?? 'SECRET_KEY';
    }

    public static function generate($payload)
    {
        $payload['exp'] = time() + (24 * 60 * 60); // 1 day expiry
        return FirebaseJWT::encode($payload, self::$secret, 'HS256');
    }

    public static function verify($token)
    {
        try {
            $decoded = FirebaseJWT::decode($token, new Key(self::$secret, 'HS256'));
            return (array) $decoded;
        } catch (\Exception $e) {
            return false;
        }
    }

    public static function getTokenFromHeader()
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
        
        return null;
    }
}