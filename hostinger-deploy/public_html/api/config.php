<?php
/**
 * StudyZone - Hostinger Business Web Hosting Configuration File
 * 
 * Instructions for Hostinger hPanel:
 * 1. Go to hPanel -> Databases -> MySQL Databases
 * 2. Create a database (e.g. u123456789_studyzone) and user (e.g. u123456789_user)
 * 3. Replace the DB credentials below with your actual Hostinger values
 */

// Hostinger MySQL Settings (Host is always localhost on Hostinger)
define('DB_HOST', 'localhost');
define('DB_USER', 'u123456789_user');          // Your Hostinger MySQL Username
define('DB_PASS', 'YourSecurePasswordHere');   // Your Hostinger MySQL Password
define('DB_NAME', 'u123456789_studyzone');     // Your Hostinger MySQL Database Name

// Library Owner & System Constants
define('OWNER_EMAIL', 'vickysingh.developer@gmail.com');
define('DEFAULT_OWNER_PASSWORD', '@Study@2011');
define('OWNER_PHONE', '6209332827');
define('OWNER_UPI_ID', '6209332827zbl@ybl');
define('LIBRARY_NAME', 'StudyZone Smart Library');
define('SITE_URL', 'https://' . ($_SERVER['HTTP_HOST'] ?? 'localhost'));

// Optional Mail Sender address for OTPs (Hostinger allows mail() from any @yourdomain.com address)
define('MAIL_FROM_EMAIL', 'no-reply@' . ($_SERVER['HTTP_HOST'] ?? 'studyzone.in'));
define('MAIL_FROM_NAME', 'StudyZone Security');

// PDO Database Connection Initialization
$pdo = null;
$dbError = null;

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    // Graceful error capture so API can return JSON diagnostic instead of fatal crash
    $dbError = $e->getMessage();
}
?>
