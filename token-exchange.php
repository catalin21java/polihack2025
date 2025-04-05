<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // For development - replace with your domain in production
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Create a log function
function logError($message, $data = null) {
    $logEntry = date('[Y-m-d H:i:s]') . " $message";
    if ($data !== null) {
        $logEntry .= " " . json_encode($data);
    }
    error_log($logEntry);
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get the request data
$requestBody = file_get_contents('php://input');
parse_str($requestBody, $postData);

// If that fails, try normal POST data
if (empty($postData)) {
    $postData = $_POST;
}

// Extract parameters
$code = isset($postData['code']) ? $postData['code'] : '';
$redirectUri = isset($postData['redirect_uri']) ? $postData['redirect_uri'] : '';
$grantType = isset($postData['grant_type']) ? $postData['grant_type'] : 'authorization_code';
$clientId = isset($postData['client_id']) ? $postData['client_id'] : '';
$clientSecret = isset($postData['client_secret']) ? $postData['client_secret'] : '';

// Google OAuth credentials from the client JSON configuration
if (empty($clientId)) {
    $clientId = '969352522616-cl4frjavmmo7bufifaraae5j7fmqpqhu.apps.googleusercontent.com';
}
if (empty($clientSecret)) {
    $clientSecret = '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';
}
if (empty($redirectUri)) {
    $redirectUri = 'http://127.0.0.1:5500/callback.html';
}

// Validation
if (empty($code)) {
    logError('Missing authorization code');
    http_response_code(400);
    echo json_encode(['error' => 'missing_code', 'error_description' => 'Authorization code is required']);
    exit;
}

// Log incoming request (sanitized)
logError('Received token exchange request', [
    'code' => substr($code, 0, 5) . '...',
    'redirect_uri' => $redirectUri,
    'grant_type' => $grantType,
    'client_id' => substr($clientId, 0, 10) . '...'
]);

// Build request data
$requestData = [
    'code' => $code,
    'client_id' => $clientId,
    'client_secret' => $clientSecret,
    'redirect_uri' => $redirectUri,
    'grant_type' => $grantType
];

// Exchange code for token
if (function_exists('curl_init')) {
    // Using cURL
    logError('Using cURL for token exchange');
    
    $ch = curl_init('https://oauth2.googleapis.com/token');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($requestData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/x-www-form-urlencoded',
        'Accept: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        $error = curl_error($ch);
        logError('cURL error', ['error' => $error, 'errno' => curl_errno($ch)]);
        http_response_code(500);
        echo json_encode(['error' => 'curl_error', 'error_description' => $error]);
        exit;
    }
    
    curl_close($ch);
    
    // Check if response is valid JSON
    $responseData = json_decode($response, true);
    if ($responseData === null && json_last_error() !== JSON_ERROR_NONE) {
        logError('Invalid JSON response', [
            'http_code' => $httpCode, 
            'response' => substr($response, 0, 200),
            'json_error' => json_last_error_msg()
        ]);
        
        http_response_code(500);
        echo json_encode(['error' => 'invalid_response', 'error_description' => 'Could not parse response from Google: ' . json_last_error_msg()]);
        exit;
    }
    
    // Check for errors in the response
    if ($httpCode >= 400 || (isset($responseData['error']) && $responseData['error'])) {
        logError('Error response from Google', [
            'http_code' => $httpCode,
            'error' => isset($responseData['error']) ? $responseData['error'] : 'Unknown error',
            'error_description' => isset($responseData['error_description']) ? $responseData['error_description'] : 'No description'
        ]);
        
        http_response_code($httpCode);
        echo $response; // Pass through the error
        exit;
    }
    
    // Log success (masking sensitive data)
    if ($responseData) {
        $logData = $responseData;
        if (isset($logData['access_token'])) {
            $logData['access_token'] = substr($logData['access_token'], 0, 10) . '...';
        }
        if (isset($logData['refresh_token'])) {
            $logData['refresh_token'] = substr($logData['refresh_token'], 0, 5) . '...';
        }
        logError('Token exchange successful', ['http_code' => $httpCode]);
    }
    
    // Return the token response
    http_response_code($httpCode);
    echo $response;
} else {
    // Fallback to file_get_contents if cURL is not available
    logError('Using file_get_contents for token exchange');
    
    $options = [
        'http' => [
            'header' => "Content-Type: application/x-www-form-urlencoded\r\nAccept: application/json\r\n",
            'method' => 'POST',
            'content' => http_build_query($requestData),
            'ignore_errors' => true
        ]
    ];
    
    $context = stream_context_create($options);
    $response = file_get_contents('https://oauth2.googleapis.com/token', false, $context);
    
    if ($response === false) {
        logError('file_get_contents failed');
        http_response_code(500);
        echo json_encode(['error' => 'request_failed', 'error_description' => 'Failed to exchange token']);
        exit;
    }
    
    // Parse response headers to get status code
    $httpStatus = 200;
    if (isset($http_response_header[0])) {
        preg_match('/HTTP\/\d\.\d\s+(\d+)/', $http_response_header[0], $matches);
        if (isset($matches[1])) {
            $httpStatus = intval($matches[1]);
        }
    }
    
    // Check if response is valid JSON
    $responseData = json_decode($response, true);
    if ($responseData === null && json_last_error() !== JSON_ERROR_NONE) {
        logError('Invalid JSON response', [
            'http_status' => $httpStatus,
            'response' => substr($response, 0, 200)
        ]);
        
        http_response_code(500);
        echo json_encode(['error' => 'invalid_response', 'error_description' => 'Invalid response from Google']);
        exit;
    }
    
    // Check for errors
    if ($httpStatus >= 400 || (isset($responseData['error']) && $responseData['error'])) {
        logError('Error response from Google', [
            'http_status' => $httpStatus,
            'error' => isset($responseData['error']) ? $responseData['error'] : 'Unknown error',
            'error_description' => isset($responseData['error_description']) ? $responseData['error_description'] : 'No description'
        ]);
        
        http_response_code($httpStatus);
        echo $response; // Pass through the error
        exit;
    }
    
    // Log success
    logError('Token exchange successful with file_get_contents');
    
    // Set status code and return response
    http_response_code($httpStatus);
    echo $response;
}
?> 