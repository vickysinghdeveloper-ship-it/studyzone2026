# StudyZone - Hostinger Business Web Hosting Deployment Guide

Follow these exact steps to deploy StudyZone on your **Hostinger Business Web Hosting**:

---

### Key Pre-Configured Credentials
- **Owner Login Email**: `vickysingh.developer@gmail.com`
- **Initial Owner Password**: `@Study@2011` *(Resettable at any time via 6-digit OTP sent to this email)*
- **UPI ID for Fee Payment QR**: `6209332827zbl@ybl`
- **WhatsApp Support & Receipt Sharing**: `6209332827`

---

### Step 1: Create MySQL Database in Hostinger hPanel
1. Log in to your **Hostinger hPanel** (https://hpanel.hostinger.com).
2. Go to **Databases -> Management -> MySQL Databases**.
3. Create a new Database:
   - **Database Name**: e.g., `u123456789_studyzone`
   - **Username**: e.g., `u123456789_user`
   - **Password**: Set a strong password (e.g., `StudyZone@Hostinger2026`).
4. Click **Create**. Copy your Database Name, Username, and Password.

---

### Step 2: Import Database Schema into phpMyAdmin
1. In Hostinger hPanel, click **Enter phpMyAdmin** next to your newly created database.
2. Inside phpMyAdmin, click your database in the left sidebar.
3. Click the **Import** tab at the top.
4. Choose the `studyzone_database.sql` file (found in `/hostinger-deploy/` or inside the ZIP).
5. Click **Go** / **Import**. All tables (`users`, `admins`, `students`, `seats`, `membership_plans`, `payments`, `attendance`, `expenses`, `notices`, `complaints`, `visitors`, `inventory`, `password_resets`) are created with initial seeds!

---

### Step 3: Upload Directly to Hostinger File Manager
1. In Hostinger hPanel, go to **Files -> File Manager**.
2. Open the **`public_html`** directory for your domain.
3. Click **Upload** at the top right:
   - Select **`studyzone_hostinger_business_public_html.zip`** (located in `/hostinger-deploy/`).
4. Right-click the uploaded ZIP file in File Manager and select **Extract**.
   - Set the destination path to `public_html`.
5. Your `public_html` folder will now contain:
   - `index.html` (the responsive SPA application)
   - `assets/` (JS and CSS bundles)
   - `api/` (PHP REST API: `config.php` and `index.php`)
   - `.htaccess` (LiteSpeed / Apache routing, SPA fallback, compression & security)
   - `studyzone_database.sql`

---

### Step 4: Configure Database Connection
1. In Hostinger File Manager, open the **`api`** folder inside `public_html`.
2. Right-click **`config.php`** and click **Edit**.
3. Update the credentials with your Hostinger database details:
   ```php
   define('DB_HOST', 'localhost'); // Hostinger MySQL Host is ALWAYS localhost
   define('DB_USER', 'u123456789_user');          // Your Hostinger DB Username
   define('DB_PASS', 'StudyZone@Hostinger2026');  // Your Hostinger DB Password
   define('DB_NAME', 'u123456789_studyzone');     // Your Hostinger DB Name
   ```
4. Click **Save** in the top right corner.

---

### Step 5: Test & Launch!
1. Open your domain (e.g. `https://yourdomain.com`) in any web browser.
2. **Master Owner Portal**:
   - Log in using `vickysingh.developer@gmail.com` and `@Study@2011`.
   - Access Student Management, Visual Seat Map, Fee Tracking, QR ID Card Generator, and the new **Admin Management** portal.
3. **Create Staff & Admins**:
   - Go to **Admin Management** to create branch managers or desk receptionists.
   - Check the exact permission boxes you want each admin to have.
   - Staff can log in directly from the **Admin Login** button on the home page!
4. **Student Portal & QR Fees**:
   - Students can check in, view seat details, and click **Pay Now** to scan the dynamic UPI QR code (`6209332827zbl@ybl`) and submit their payment receipt to WhatsApp (`6209332827`).
