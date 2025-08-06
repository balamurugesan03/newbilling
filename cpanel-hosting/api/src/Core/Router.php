<?php

namespace App\Core;

class Router
{
    private $routes = [];
    private $middlewares = [];

    public function addRoute($method, $path, $handler, $middlewares = [])
    {
        $this->routes[] = [
            'method' => strtoupper($method),
            'path' => $path,
            'handler' => $handler,
            'middlewares' => $middlewares
        ];
    }

    public function get($path, $handler, $middlewares = [])
    {
        $this->addRoute('GET', $path, $handler, $middlewares);
    }

    public function post($path, $handler, $middlewares = [])
    {
        $this->addRoute('POST', $path, $handler, $middlewares);
    }

    public function put($path, $handler, $middlewares = [])
    {
        $this->addRoute('PUT', $path, $handler, $middlewares);
    }

    public function delete($path, $handler, $middlewares = [])
    {
        $this->addRoute('DELETE', $path, $handler, $middlewares);
    }

    public function handle()
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        // Remove base path if running in subdirectory
        $basePath = dirname($_SERVER['SCRIPT_NAME']);
        if ($basePath !== '/') {
            $path = str_replace($basePath, '', $path);
        }
        
        foreach ($this->routes as $route) {
            if ($route['method'] === $method && $this->matchPath($route['path'], $path)) {
                // Extract parameters
                $params = $this->extractParams($route['path'], $path);
                
                // Run middlewares
                foreach ($route['middlewares'] as $middleware) {
                    $result = call_user_func($middleware);
                    if ($result === false) {
                        return; // Middleware stopped execution
                    }
                }
                
                // Call handler
                if (is_array($route['handler'])) {
                    $controller = new $route['handler'][0]();
                    $method = $route['handler'][1];
                    if (!empty($params)) {
                        call_user_func_array([$controller, $method], $params);
                    } else {
                        $controller->$method();
                    }
                } else {
                    call_user_func($route['handler']);
                }
                return;
            }
        }
        
        // No route found
        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
    }

    private function matchPath($routePath, $requestPath)
    {
        // Convert route path to regex
        $pattern = preg_replace('/\{[^}]+\}/', '([^/]+)', $routePath);
        $pattern = str_replace('/', '\/', $pattern);
        $pattern = '/^' . $pattern . '$/';
        
        return preg_match($pattern, $requestPath);
    }

    private function extractParams($routePath, $requestPath)
    {
        $routeParts = explode('/', trim($routePath, '/'));
        $requestParts = explode('/', trim($requestPath, '/'));
        
        $params = [];
        
        for ($i = 0; $i < count($routeParts); $i++) {
            if (preg_match('/^\{([^}]+)\}$/', $routeParts[$i], $matches)) {
                $params[] = $requestParts[$i] ?? null;
            }
        }
        
        return $params;
    }
}