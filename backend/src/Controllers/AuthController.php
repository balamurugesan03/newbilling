<?php

namespace App\Controllers;

use App\Models\User;
use App\Utils\JWT;

class AuthController
{
    private $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    public function register()
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input['username'] || !$input['password']) {
                http_response_code(400);
                echo json_encode(['error' => 'Username and password are required']);
                return;
            }

            // Check if user already exists
            $existingUser = $this->userModel->findByUsername($input['username']);
            if ($existingUser) {
                http_response_code(400);
                echo json_encode(['error' => 'Username already exists']);
                return;
            }

            $result = $this->userModel->create($input);
            
            if ($result) {
                http_response_code(201);
                echo json_encode(['message' => 'User created successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create user']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function login()
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input['username'] || !$input['password']) {
                http_response_code(400);
                echo json_encode(['error' => 'Username and password are required']);
                return;
            }

            $user = $this->userModel->findByUsername($input['username']);
            
            if (!$user || !$this->userModel->verifyPassword($input['password'], $user['password'])) {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid credentials']);
                return;
            }

            $token = JWT::generate([
                'id' => $user['id'],
                'username' => $user['username']
            ]);

            echo json_encode([
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username']
                ]
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}