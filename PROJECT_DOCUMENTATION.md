# Real-Time Website Monitoring System — Detailed Project Documentation

This document provides a comprehensive technical overview of the Real-Time Website Monitoring System, detailing its architecture, database design, feature implementation, and operational instructions.

---

## 1. Project Overview & Architecture

The system is designed to allow administrators to configure client emails and a list of target website URLs to monitor. It runs a periodic background checking engine that probes these websites, measures latency, detects errors or timeouts, updates the database, and alerts clients when their website status changes to "down". 

The architecture is split into:
* **Backend**: Powered by **Laravel 11**, exposing REST endpoints, holding database schemas, handling background tasks via Artisan commands/scheduler, and orchestrating email notifications.
* **Frontend**: A **Vue 3** Single Page Application (embedded inline within a Laravel blade template) that provides a reactive dashboard for selecting clients and displaying their monitored websites.
* **Database**: **SQLite** database stores clients and websites records.
* **Alerting**: Integrates SMTP mailers (such as **Mailtrap** or **Gmail**) to dispatch alerts when site status transitions occur.

---

## 2. Database Schema

The database consists of two primary tables that hold client information and their monitored websites.

### `clients` Table
Stores unique client emails.
* `id` (Primary Key, integer)
* `email` (string, unique) — Client email address.
* `created_at` / `updated_at` (timestamps)

### `websites` Table
Stores target URLs linked to clients, along with their current health state metrics.
* `id` (Primary Key, integer)
* `client_id` (Foreign Key) — Cascades on delete of parent client.
* `url` (string, 2048 characters max) — Website homepage URL.
* `status` (string, default: `pending`) — Status values: `pending`, `up`, or `down`.
* `status_code` (integer, nullable) — Last recorded HTTP status code (e.g. 200, 404, 500).
* `latency_ms` (integer, nullable) — Response time in milliseconds.
* `last_checked_at` (timestamp, nullable) — When the website was last checked.
* `last_error` (text, nullable) — Error message if connection failed or timed out.
* `created_at` / `updated_at` (timestamps)

---

## 3. Implementation of Functional Requirements

### Requirement 1: Client Input & DB Entry
* Client records map emails to target websites using a **1-to-many relationship** (implemented via Eloquent's `hasMany` and `belongsTo` relations).
* Admins can configure initial data directly in the database during deployment using seeders or tinker.
* **Implementation files:**
  * Model: [Client.php](file:///c:/Users/pdhan/OneDrive/Desktop/Real-Time%20Website%20Monitoring%20System/backend/app/Models/Client.php)
  * Model: [Website.php](file:///c:/Users/pdhan/OneDrive/Desktop/Real-Time%20Website%20Monitoring%20System/backend/app/Models/Website.php)
  * Seeder: [ClientWebsiteSeeder.php](file:///c:/Users/pdhan/OneDrive/Desktop/Real-Time%20Website%20Monitoring%20System/backend/database/seeders/ClientWebsiteSeeder.php)

### Requirement 2: Website Monitoring Process
* Probing checks are done using Laravel’s `Http` client.
* **Timeout limit**: A maximum timeout of **10 seconds** is enforced using `Http::timeout(10)->get(...)`.
* **State logic**: 
  * If a request completes and returns an HTTP status code < 400, the website is marked as `up`.
  * If a request returns an HTTP status code >= 400 or fails/times out, it triggers an exception catch block and is marked as `down`.
* **Execution**: Checked periodically by calling the command `php artisan monitor:websites`, scheduled to run **every 15 minutes** in Laravel’s schedule routine.
* **Implementation files:**
  * Service class: [WebsiteMonitorService.php](file:///c:/Users/pdhan/OneDrive/Desktop/Real-Time%20Website%20Monitoring%20System/backend/app/Services/WebsiteMonitorService.php)
  * Command: [MonitorWebsitesCommand.php](file:///c:/Users/pdhan/OneDrive/Desktop/Real-Time%20Website%20Monitoring%20System/backend/app/Console/Commands/MonitorWebsitesCommand.php)
  * Schedule registration: [console.php](file:///c:/Users/pdhan/OneDrive/Desktop/Real-Time%20Website%20Monitoring%20System/backend/routes/console.php)

### Requirement 3: Email Notification System
* Emails are dispatched to the client's email address if a website status transitions to `down` (detected by checking `$previousStatus !== 'down' && $currentStatus === 'down'`). This logic prevents spamming alerts on successive down checks.
* **Email sender**: `do-not-reply@example.com`
* **Email subject**: `{website URL} is down!`
* **Email body**: `{website URL} is down!`
* **Implementation files:**
  * Mailable: [WebsiteDownMail.php](file:///c:/Users/pdhan/OneDrive/Desktop/Real-Time%20Website%20Monitoring%20System/backend/app/Mail/WebsiteDownMail.php)
  * Template: [website-down.blade.php](file:///c:/Users/pdhan/OneDrive/Desktop/Real-Time%20Website%20Monitoring%20System/backend/resources/views/emails/website-down.blade.php)

### Requirement 4: Client Dashboard & UI Display
* **Home Page**: Serves a select input populated with all registered client emails loaded via the controller api endpoint `/api/clients`.
* **Hyperlink display**: Upon selecting an email, Vue dynamically filters and displays the client's websites as clickable hyperlinks.
* **Confirm modal dialog**: Clicking a link intercepts navigation (`@click.prevent`) and opens a dialog stating: *"You are about to visit {website}. Do you want to continue?"*.
  * If the user clicks **Continue**, the target URL is launched in a new browser tab with safe attributes (`window.open(url, '_blank', 'noopener,noreferrer')`).
  * If the user clicks **Cancel**, the modal closes and navigation is aborted.
* **Implementation files:**
  * Controller: [ClientController.php](file:///c:/Users/pdhan/OneDrive/Desktop/Real-Time%20Website%20Monitoring%20System/backend/app/Http/Controllers/ClientController.php)
  * UI Template & Javascript: [app.js](file:///c:/Users/pdhan/OneDrive/Desktop/Real-Time%20Website%20Monitoring%20System/backend/resources/js/app.js)
  * Styling: [app.css](file:///c:/Users/pdhan/OneDrive/Desktop/Real-Time%20Website%20Monitoring%20System/backend/resources/css/app.css)

---

## 4. Setup & Deployment Guide

### Prerequisites
* PHP >= 8.3 with sqlite3, openssl, and curl extensions.
* Composer dependency manager.
* Node.js & NPM.

### Installation Steps

1. **Clone & Setup Environment**
   Ensure `.env` file exists (copied from `.env.example`).
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

2. **Configure Database**
   Ensure SQLite database is created:
   ```powershell
   # Windows PowerShell
   New-Item -ItemType File -Path "database/database.sqlite" -Force
   ```
   Run database migrations and seeders:
   ```bash
   php artisan migrate --force
   php artisan db:seed --force
   ```

3. **Configure SMTP (Mailtrap / Gmail)**
   Update the mail section in `.env` to connect to your SMTP provider.
   Example Mailtrap configuration:
   ```env
   MAIL_MAILER=smtp
   MAIL_HOST=sandbox.smtp.mailtrap.io
   MAIL_PORT=2525
   MAIL_USERNAME=65dd48aef21d9c
   MAIL_PASSWORD=2c051ae54123ee
   MAIL_ENCRYPTION=tls
   MAIL_FROM_ADDRESS="do-not-reply@example.com"
   MAIL_FROM_NAME="Website Uptime Monitor"
   ```

4. **Install Node modules & Build assets**
   ```bash
   npm install
   npm run build
   ```

5. **Start Dev Server**
   Start the backend application server:
   ```bash
   composer run dev
   ```
   *Access the app at [http://localhost](http://localhost).*

---

## 5. Background Task Scheduling (Windows)

To automate the checking mechanism every 15 minutes, the Laravel scheduler command must be run continuously. Since standard Cron jobs do not run natively on Windows, Windows Task Scheduler is utilized.

### Activating the Scheduler
We have provided a helper PowerShell script to easily register this task. Open PowerShell **as Administrator** and execute:
```powershell
powershell -ExecutionPolicy Bypass -File "setup-scheduler.ps1"
```
This registers a new background task named `LaravelWebsiteMonitor` in the system that triggers `php artisan schedule:run` every minute.

### Deactivating the Scheduler
To clean up and remove the scheduler task, run:
```powershell
powershell -ExecutionPolicy Bypass -File "remove-scheduler.ps1"
```

---

## 6. Manual Verification & Troubleshooting

### Trigger Checks Instantly
To check all websites immediately without waiting for the scheduled 15-minute intervals, run:
```bash
php artisan monitor:websites
```

### Inspecting Database Entries
You can check database values using tinker:
```bash
php artisan tinker
```
Inside the interactive tinker shell, run:
```php
App\Models\Website::all();
```

### Checking Outgoing Emails
All alert emails triggered by status transitions will be captured in your Mailtrap inbox (or delivered to the user inbox if configured with actual SMTP credentials). You can inspect incoming mail bodies and headers to verify formatting.
