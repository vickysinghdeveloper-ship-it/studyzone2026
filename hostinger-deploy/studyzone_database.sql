-- ========================================================
-- StudyZone - Smart Library & Study Center Management System
-- Optimized for Hostinger Business Web Hosting (PHP 8.1+ & MySQL 8.0/MariaDB)
-- Generated for Owner: vickysingh.developer@gmail.com
-- ========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+05:30";

-- --------------------------------------------------------
-- Table structure for table `users` (Owner Master Account)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `role` ENUM('owner', 'manager', 'receptionist', 'staff') NOT NULL DEFAULT 'owner',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Master Owner Account (Email: vickysingh.developer@gmail.com, Initial Password: @Study@2011)
INSERT INTO `users` (`name`, `email`, `password_hash`, `phone`, `role`, `status`) VALUES
('Vicky Singh', 'vickysingh.developer@gmail.com', '$2y$10$wNqH.L2wzE00G5Q0wH6XU.J1k6bJqO8/gVz8q07T7p0u7a1fRzRk6', '6209332827', 'owner', 'active')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- --------------------------------------------------------
-- Table structure for table `admins` (Staff & Admin Accounts with Checkbox Permissions)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `role_title` VARCHAR(100) NOT NULL DEFAULT 'Library Admin',
  `permissions` TEXT NOT NULL,
  `status` ENUM('active', 'restricted') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_login` DATE DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Sample Admins created by owner
INSERT INTO `admins` (`id`, `name`, `email`, `password`, `phone`, `role_title`, `permissions`, `status`, `last_login`) VALUES
('adm_rahul_01', 'Rahul Sharma', 'rahul.manager@studyzone.in', 'Admin@123', '9876543210', 'Shift Manager & Supervisor', '["dashboard","students","seats","attendance","payments","complaints","visitors"]', 'active', '2026-09-14'),
('adm_priya_02', 'Priya Verma', 'priya.desk@studyzone.in', 'Desk@123', '9876543211', 'Front Desk Receptionist', '["students","seats","attendance","payments","visitors"]', 'active', '2026-09-15')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- --------------------------------------------------------
-- Table structure for table `password_resets` (OTP Password Reset Log)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(120) NOT NULL,
  `otp_code` VARCHAR(10) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `system_settings`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `system_settings` (
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT NOT NULL,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `system_settings` (`setting_key`, `setting_value`) VALUES
('library_name', 'StudyZone Smart Library & Study Lounge'),
('tagline', 'Your Peaceful Learning Destination with Dedicated Power & High-Speed WiFi'),
('owner_name', 'Vicky Singh'),
('owner_email', 'vickysingh.developer@gmail.com'),
('phone', '6209332827'),
('whatsapp_number', '6209332827'),
('upi_id', '6209332827zbl@ybl'),
('currency_symbol', '₹'),
('address', 'Plot No. 42, Knowledge Park III, Near Metro Station, Sector 62, Noida, UP - 201309'),
('map_embed_url', 'https://maps.google.com/maps?q=Noida+Sector+62&t=&z=14&ie=UTF8&iwloc=&output=embed')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

-- --------------------------------------------------------
-- Table structure for table `membership_plans`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `membership_plans` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `shift` ENUM('morning', 'evening', 'night', 'fullday', 'custom') NOT NULL,
  `shift_timing` VARCHAR(100) NOT NULL,
  `duration_days` INT(11) NOT NULL DEFAULT 30,
  `price` DECIMAL(10,2) NOT NULL,
  `total_seats` INT(11) NOT NULL DEFAULT 30,
  `available_seats` INT(11) NOT NULL DEFAULT 30,
  `description` TEXT DEFAULT NULL,
  `late_fine_per_day` DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  `grace_period_days` INT(11) NOT NULL DEFAULT 3,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `membership_plans` (`id`, `title`, `shift`, `shift_timing`, `duration_days`, `price`, `total_seats`, `available_seats`, `description`) VALUES
('slot_morning', 'Morning Shift Pass', 'morning', '06:00 AM - 12:00 PM', 30, 1200.00, 30, 22, 'Early bird study pass with RO water and fresh quiet atmosphere.'),
('slot_evening', 'Evening Shift Pass', 'evening', '12:00 PM - 06:00 PM', 30, 1300.00, 30, 25, 'Afternoon reading pass for students & aspirants.'),
('slot_night', 'Night Owl Revision Pass', 'night', '06:00 PM - 12:00 AM', 30, 1400.00, 25, 18, 'Night revision pass with high intensity anti-glare LED desks.'),
('slot_fullday', '24-Hour Master Pass', 'fullday', '24 Hours Open', 30, 2400.00, 40, 15, '24x7 Unlimited pass with personal locker & prime seat priority.')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- --------------------------------------------------------
-- Table structure for table `seats`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `seats` (
  `id` VARCHAR(50) NOT NULL,
  `seat_number` VARCHAR(20) NOT NULL UNIQUE,
  `floor_zone` ENUM('ground', 'first', 'reading_hall', 'ac_room', 'silent_zone', 'girls_section') NOT NULL,
  `status` ENUM('available', 'occupied', 'reserved', 'maintenance', 'cleaning') NOT NULL DEFAULT 'available',
  `current_student_id` VARCHAR(50) DEFAULT NULL,
  `current_student_name` VARCHAR(100) DEFAULT NULL,
  `current_student_phone` VARCHAR(20) DEFAULT NULL,
  `slot_bookings` TEXT DEFAULT NULL,
  `is_power_plug` TINYINT(1) DEFAULT 1,
  `is_locker` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `seats` (`id`, `seat_number`, `floor_zone`, `status`, `is_power_plug`, `is_locker`) VALUES
('seat_g01', 'G-01', 'ground', 'occupied', 1, 1),
('seat_g02', 'G-02', 'ground', 'occupied', 1, 0),
('seat_g03', 'G-03', 'ground', 'available', 1, 0),
('seat_g04', 'G-04', 'ground', 'available', 1, 0),
('seat_f01', 'F-01', 'first', 'occupied', 1, 1),
('seat_f02', 'F-02', 'first', 'available', 1, 0),
('seat_ac01', 'AC-01', 'ac_room', 'occupied', 1, 1),
('seat_sz01', 'SZ-01', 'silent_zone', 'occupied', 1, 1),
('seat_grl01', 'GRL-01', 'girls_section', 'available', 1, 1)
ON DUPLICATE KEY UPDATE `seat_number` = VALUES(`seat_number`);

-- --------------------------------------------------------
-- Table structure for table `students`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `students` (
  `id` VARCHAR(50) NOT NULL,
  `student_code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(120) DEFAULT NULL,
  `gender` ENUM('male', 'female', 'other') DEFAULT 'male',
  `photo_url` TEXT DEFAULT NULL,
  `aadhaar_number` VARCHAR(30) DEFAULT NULL,
  `guardian_name` VARCHAR(100) DEFAULT NULL,
  `guardian_phone` VARCHAR(20) DEFAULT NULL,
  `emergency_contact` VARCHAR(20) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `college_or_work` VARCHAR(150) DEFAULT NULL,
  `target_exam` VARCHAR(150) DEFAULT NULL,
  `joined_date` DATE NOT NULL,
  `plan_id` VARCHAR(50) NOT NULL,
  `plan_name` VARCHAR(100) DEFAULT NULL,
  `shift` VARCHAR(50) NOT NULL,
  `seat_id` VARCHAR(50) DEFAULT NULL,
  `seat_number` VARCHAR(20) DEFAULT NULL,
  `expiry_date` DATE NOT NULL,
  `status` ENUM('active', 'inactive', 'expired', 'pending_due') DEFAULT 'active',
  `total_paid` DECIMAL(10,2) DEFAULT 0.00,
  `pending_fee` DECIMAL(10,2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `payments`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payments` (
  `id` VARCHAR(50) NOT NULL,
  `receipt_number` VARCHAR(50) NOT NULL UNIQUE,
  `student_id` VARCHAR(50) NOT NULL,
  `student_name` VARCHAR(100) NOT NULL,
  `student_code` VARCHAR(50) DEFAULT NULL,
  `plan_id` VARCHAR(50) NOT NULL,
  `plan_name` VARCHAR(100) DEFAULT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `discount` DECIMAL(10,2) DEFAULT 0.00,
  `late_fine` DECIMAL(10,2) DEFAULT 0.00,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `payment_method` ENUM('cash', 'upi', 'bank_transfer', 'card') NOT NULL,
  `transaction_ref` VARCHAR(100) DEFAULT NULL,
  `payment_date` DATE NOT NULL,
  `status` ENUM('paid', 'pending', 'partial', 'refunded') DEFAULT 'paid',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `attendance`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(50) NOT NULL,
  `student_name` VARCHAR(100) NOT NULL,
  `student_code` VARCHAR(50) DEFAULT NULL,
  `seat_number` VARCHAR(20) DEFAULT NULL,
  `date` DATE NOT NULL,
  `check_in_time` TIME NOT NULL,
  `check_out_time` TIME DEFAULT NULL,
  `status` ENUM('present', 'absent', 'late', 'early_exit') DEFAULT 'present',
  `mode` ENUM('manual', 'qr_scan', 'student_app') DEFAULT 'manual',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `expenses`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(50) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `date` DATE NOT NULL,
  `vendor_name` VARCHAR(100) DEFAULT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'cash',
  `notes` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `notices`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notices` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `category` ENUM('maintenance', 'event', 'policy', 'holiday', 'announcement') DEFAULT 'announcement',
  `posted_date` DATE NOT NULL,
  `posted_by` VARCHAR(100) DEFAULT 'Library Management',
  `is_pinned` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `complaints`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `complaints` (
  `id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(50) DEFAULT NULL,
  `student_name` VARCHAR(100) NOT NULL,
  `student_code` VARCHAR(50) DEFAULT NULL,
  `student_phone` VARCHAR(20) DEFAULT NULL,
  `seat_number` VARCHAR(20) DEFAULT NULL,
  `category` ENUM('wifi', 'ac_cooling', 'cleanliness', 'noise', 'lighting', 'chair_desk', 'washroom', 'other') DEFAULT 'other',
  `subject` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `status` ENUM('pending', 'in_progress', 'resolved', 'dismissed') DEFAULT 'pending',
  `owner_reply` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `visitors`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `visitors` (
  `id` VARCHAR(50) NOT NULL,
  `pass_number` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `purpose` VARCHAR(150) NOT NULL,
  `entry_time` VARCHAR(20) NOT NULL,
  `exit_time` VARCHAR(20) DEFAULT NULL,
  `date` DATE NOT NULL,
  `notes` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `inventory`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `inventory` (
  `id` VARCHAR(50) NOT NULL,
  `item_name` VARCHAR(150) NOT NULL,
  `category` ENUM('furniture', 'electrical', 'networking', 'water_sanitary', 'books', 'stationery', 'other') NOT NULL,
  `quantity` INT(11) NOT NULL DEFAULT 1,
  `working_condition` ENUM('excellent', 'good', 'needs_repair', 'damaged') DEFAULT 'good',
  `location` VARCHAR(100) DEFAULT NULL,
  `last_service_date` DATE DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
