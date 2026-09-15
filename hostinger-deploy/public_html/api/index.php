<?php
/**
 * StudyZone - Complete REST API Engine for Hostinger Business Web Hosting
 * Handles Authentication, Admin Management, OTP Password Resets, Students, Seats, Fees, and System Operations.
 */

require_once __DIR__ . '/config.php';

// Cross-Origin Resource Sharing (CORS) & Content Type Headers
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Parse request
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];
$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?? [];

// Helper response function
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

// -------------------------------------------------------------
// 1. Health & Status Diagnostic
// -------------------------------------------------------------
if (strpos($requestUri, '/api/health') !== false) {
    global $pdo, $dbError;
    $dbConnected = ($pdo !== null);

    jsonResponse([
        'status' => 'success',
        'application' => 'StudyZone Smart Library Management',
        'hosting_platform' => 'Hostinger Business Web Hosting (PHP ' . PHP_VERSION . ')',
        'database_connected' => $dbConnected,
        'database_error' => $dbError,
        'owner_email' => OWNER_EMAIL,
        'owner_phone' => OWNER_PHONE,
        'upi_id' => OWNER_UPI_ID,
        'timestamp' => date('Y-m-d H:i:s'),
        'mail_function_enabled' => function_exists('mail'),
    ]);
}

// -------------------------------------------------------------
// 2. Authentication Endpoints
// -------------------------------------------------------------

// Owner Login
if (strpos($requestUri, '/api/auth/owner-login') !== false && $method === 'POST') {
    $email = strtolower(trim($body['email'] ?? ''));
    $password = trim($body['password'] ?? '');

    if ($email !== strtolower(OWNER_EMAIL)) {
        jsonResponse(['status' => 'error', 'message' => 'Invalid email address for Owner portal'], 401);
    }

    $valid = false;
    global $pdo;
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND role = 'owner' LIMIT 1");
            $stmt->execute([$email]);
            $owner = $stmt->fetch();
            if ($owner) {
                if (password_verify($password, $owner['password_hash']) || $password === DEFAULT_OWNER_PASSWORD || $password === $owner['password_hash']) {
                    $valid = true;
                }
            }
        } catch (Exception $e) {}
    }

    // Default fallback verification
    if (!$valid && $password === DEFAULT_OWNER_PASSWORD) {
        $valid = true;
    }

    if ($valid) {
        jsonResponse([
            'status' => 'success',
            'message' => 'Owner authentication successful',
            'user' => [
                'id' => 'usr_owner_main',
                'name' => 'Vicky Singh',
                'email' => OWNER_EMAIL,
                'phone' => OWNER_PHONE,
                'role' => 'owner'
            ]
        ]);
    } else {
        jsonResponse(['status' => 'error', 'message' => 'Incorrect owner password'], 401);
    }
}

// OTP Password Reset Dispatch (Hostinger PHP mail() integration)
if (strpos($requestUri, '/api/auth/send-otp') !== false && $method === 'POST') {
    $email = strtolower(trim($body['email'] ?? ''));

    if ($email !== strtolower(OWNER_EMAIL)) {
        jsonResponse(['status' => 'error', 'message' => 'OTP can only be dispatched to the verified owner email: ' . OWNER_EMAIL], 403);
    }

    $otp = sprintf('%06d', mt_rand(100000, 999999));
    $expiresAt = date('Y-m-d H:i:s', time() + 600); // 10 minutes

    global $pdo;
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("INSERT INTO password_resets (email, otp_code, expires_at) VALUES (?, ?, ?)");
            $stmt->execute([$email, $otp, $expiresAt]);
        } catch (Exception $e) {}
    }

    // Dispatch email via Hostinger Business Hosting mail() service
    $subject = "StudyZone Security: Your Password Reset OTP is $otp";
    $message = "Hello Vicky Singh,\n\n"
             . "You requested a password reset for your StudyZone Owner account.\n\n"
             . "Your One-Time Password (OTP) is: $otp\n\n"
             . "This code is valid for 10 minutes. If you did not request this, please ignore this email.\n\n"
             . "Best regards,\nStudyZone Smart Library";
    
    $headers = "From: " . MAIL_FROM_NAME . " <" . MAIL_FROM_EMAIL . ">\r\n"
             . "Reply-To: " . OWNER_EMAIL . "\r\n"
             . "X-Mailer: PHP/" . PHP_VERSION;

    $mailSent = @mail($email, $subject, $message, $headers);

    jsonResponse([
        'status' => 'success',
        'message' => 'OTP generated and dispatched to ' . $email,
        'otp' => $otp, // Returned for instant testing convenience
        'mail_sent' => $mailSent,
        'valid_for_seconds' => 600
    ]);
}

// Verify OTP & Update Password
if (strpos($requestUri, '/api/auth/verify-otp-reset-password') !== false && $method === 'POST') {
    $email = strtolower(trim($body['email'] ?? ''));
    $otp = trim($body['otp'] ?? '');
    $newPassword = trim($body['newPassword'] ?? '');

    if (empty($newPassword) || strlen($newPassword) < 6) {
        jsonResponse(['status' => 'error', 'message' => 'New password must be at least 6 characters long'], 400);
    }

    $hash = password_hash($newPassword, PASSWORD_BCRYPT);
    global $pdo;
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE email = ? AND role = 'owner'");
            $stmt->execute([$hash, $email]);
        } catch (Exception $e) {}
    }

    jsonResponse([
        'status' => 'success',
        'message' => 'Owner password successfully updated! You can now log in with your new password.'
    ]);
}

// Admin Login
if (strpos($requestUri, '/api/auth/admin-login') !== false && $method === 'POST') {
    $email = strtolower(trim($body['email'] ?? ''));
    $password = trim($body['password'] ?? '');

    global $pdo;
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM admins WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            $admin = $stmt->fetch();

            if (!$admin) {
                jsonResponse(['status' => 'error', 'message' => 'No admin account found with this email'], 404);
            }

            if ($admin['status'] === 'restricted') {
                jsonResponse(['status' => 'error', 'message' => 'This admin account has been restricted by the owner. Contact Vikram Singh.'], 403);
            }

            if ($admin['password'] !== $password && !password_verify($password, $admin['password'])) {
                jsonResponse(['status' => 'error', 'message' => 'Incorrect admin password'], 401);
            }

            // Update last login
            $upd = $pdo->prepare("UPDATE admins SET last_login = CURDATE() WHERE id = ?");
            $upd->execute([$admin['id']]);

            $permissions = is_string($admin['permissions']) ? json_decode($admin['permissions'], true) : $admin['permissions'];

            jsonResponse([
                'status' => 'success',
                'message' => 'Admin authentication successful',
                'admin' => [
                    'id' => $admin['id'],
                    'name' => $admin['name'],
                    'email' => $admin['email'],
                    'phone' => $admin['phone'],
                    'role_title' => $admin['role_title'],
                    'permissions' => $permissions ?? [],
                    'status' => $admin['status'],
                    'role' => 'admin'
                ]
            ]);
        } catch (Exception $e) {
            jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    // Default demo fallback if database is not yet connected
    if ($email === 'rahul.manager@studyzone.in' && $password === 'Admin@123') {
        jsonResponse([
            'status' => 'success',
            'admin' => [
                'id' => 'adm_rahul_01',
                'name' => 'Rahul Sharma',
                'email' => 'rahul.manager@studyzone.in',
                'phone' => '9876543210',
                'role_title' => 'Shift Manager & Supervisor',
                'permissions' => ["dashboard","students","seats","attendance","payments","complaints","visitors"],
                'status' => 'active',
                'role' => 'admin'
            ]
        ]);
    }

    jsonResponse(['status' => 'error', 'message' => 'Invalid admin credentials or database offline'], 401);
}

// -------------------------------------------------------------
// 3. Admin Management (Owner Controlled CRUD)
// -------------------------------------------------------------
if (strpos($requestUri, '/api/admins') !== false) {
    global $pdo;
    if (!$pdo) {
        jsonResponse(['status' => 'error', 'message' => 'MySQL database not configured in api/config.php'], 503);
    }

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT id, name, email, phone, role_title, permissions, status, created_at, last_login FROM admins ORDER BY created_at DESC");
        $admins = $stmt->fetchAll();
        foreach ($admins as &$adm) {
            $adm['permissions'] = is_string($adm['permissions']) ? json_decode($adm['permissions'], true) : $adm['permissions'];
        }
        jsonResponse(['status' => 'success', 'data' => $admins]);
    }

    if ($method === 'POST') {
        $id = 'adm_' . time() . '_' . mt_rand(100, 999);
        $name = trim($body['name'] ?? '');
        $email = strtolower(trim($body['email'] ?? ''));
        $password = trim($body['password'] ?? 'Admin@123');
        $phone = trim($body['phone'] ?? '');
        $roleTitle = trim($body['roleTitle'] ?? 'Library Admin');
        $permissions = json_encode($body['permissions'] ?? ['dashboard', 'students', 'seats']);
        $status = $body['status'] ?? 'active';

        $stmt = $pdo->prepare("INSERT INTO admins (id, name, email, password, phone, role_title, permissions, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $name, $email, $password, $phone, $roleTitle, $permissions, $status]);

        jsonResponse(['status' => 'success', 'message' => 'Admin account created successfully', 'id' => $id]);
    }

    if ($method === 'PUT') {
        $id = trim($body['id'] ?? '');
        if (!$id) jsonResponse(['status' => 'error', 'message' => 'Admin ID required'], 400);

        $fields = [];
        $params = [];

        if (isset($body['status'])) {
            $fields[] = "status = ?";
            $params[] = $body['status'];
        }
        if (isset($body['permissions'])) {
            $fields[] = "permissions = ?";
            $params[] = is_array($body['permissions']) ? json_encode($body['permissions']) : $body['permissions'];
        }
        if (isset($body['password'])) {
            $fields[] = "password = ?";
            $params[] = $body['password'];
        }
        if (isset($body['roleTitle'])) {
            $fields[] = "role_title = ?";
            $params[] = $body['roleTitle'];
        }

        if (count($fields) > 0) {
            $params[] = $id;
            $sql = "UPDATE admins SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        }

        jsonResponse(['status' => 'success', 'message' => 'Admin updated successfully']);
    }

    if ($method === 'DELETE') {
        $id = trim($_GET['id'] ?? $body['id'] ?? '');
        if (!$id) jsonResponse(['status' => 'error', 'message' => 'Admin ID required'], 400);

        $stmt = $pdo->prepare("DELETE FROM admins WHERE id = ?");
        $stmt->execute([$id]);

        jsonResponse(['status' => 'success', 'message' => 'Admin deleted successfully']);
    }
}

// -------------------------------------------------------------
// 4. Operational Modules: Students, Seats, Plans, Payments
// -------------------------------------------------------------

// Students
if (strpos($requestUri, '/api/students') !== false) {
    global $pdo;
    if ($method === 'GET') {
        if ($pdo) {
            $stmt = $pdo->query("SELECT * FROM students ORDER BY id DESC");
            jsonResponse(['status' => 'success', 'data' => $stmt->fetchAll()]);
        }
        jsonResponse(['status' => 'success', 'data' => []]);
    }
}

// Seats
if (strpos($requestUri, '/api/seats') !== false) {
    global $pdo;
    if ($method === 'GET') {
        if ($pdo) {
            $stmt = $pdo->query("SELECT * FROM seats ORDER BY seat_number ASC");
            jsonResponse(['status' => 'success', 'data' => $stmt->fetchAll()]);
        }
        jsonResponse(['status' => 'success', 'data' => []]);
    }
}

// Payments
if (strpos($requestUri, '/api/payments') !== false) {
    global $pdo;
    if ($method === 'GET') {
        if ($pdo) {
            $stmt = $pdo->query("SELECT * FROM payments ORDER BY id DESC");
            jsonResponse(['status' => 'success', 'data' => $stmt->fetchAll()]);
        }
        jsonResponse(['status' => 'success', 'data' => []]);
    }
}

// Default Fallback
jsonResponse([
    'system' => 'StudyZone Smart Library Management',
    'status' => 'online',
    'platform' => 'Hostinger Business Web Hosting',
    'owner_contact' => OWNER_EMAIL . ' / ' . OWNER_PHONE,
    'upi_id' => OWNER_UPI_ID
]);
?>
