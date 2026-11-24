# MyWorkspace

MyWorkspace is a Laravel 12 + Inertia.js + React 19 admin application. Sign in at `/` to access the administrator workspace featuring task management, administrator accounts, database tools, the SP ID Generator, and monthly CSV allocation.

**Tech Stack:** PHP 8.2+, Laravel 12, SQLite (primary), Inertia.js, React 19, TailwindCSS 4, Vite 7

---

## Current Database Schema

After all migrations, these tables remain active:

| Table | Purpose |
|-------|---------|
| `helpdesk_users` | Administrator accounts (username, email, password_hash, role: admin/staff, is_active) |
| `helpdesk_accomplishments` | Tasks with title, description, due_date, status (todo/done), completed_at, created_by |
| `helpdesk_notification_settings` | Per-admin browser notification preferences (task_due, etc.) |
| `helpdesk_settings` | Key-value settings (monthly CSV targets, base amounts, SP ID generator config) |
| `migrations` | Laravel migration history |

**Removed (irreversible):** tickets, notices, chat tables, task_board, cache/cache_locks

---

## Features

### Administrator Dashboard (`/admin`)
Overview of tasks, quick actions, and notification status.

### Task Management (`/admin/accomplishments`)
- Create, update, complete, delete tasks
- Due dates with browser notification reminders
- Status: `todo` → `done` (with `completed_at` timestamp)
- Indexed by owner + status + created_at for performance

### Administrator Accounts (`/admin/users`)
- Create new admins (name, email, password, role: admin/staff)
- Toggle active/inactive status
- **Usernames** are unique; emails are **not** unique (allows shared inboxes)
- Staff accounts exist but cannot be promoted via UI

### Database Tools (`/admin/database`)
- **Table browser** with pagination, search, column visibility
- **SQL query runner** (read-only SELECT by default; write requires confirmation)
- **Export** entire SQLite database as `.sqlite` file
- **Import** `.sqlite` file (replaces local DB; stops app first)
- **Backup to Aiven MySQL** — preview → confirm → snapshots destination → clones managed tables
- **Restore from Aiven** — preview → confirm → snapshots local → replaces managed tables
- **Row-level CRUD** (create/edit/delete records in any table)
- **Metrics** — row counts, table sizes, Aiven sync status
- Managed tables: users, settings, notification_settings, accomplishments, migrations
- 20,000 row cap per table per database
- Private snapshots in `storage/app/private/database-backups/`

### SP ID Generator (`/admin/tools/id-generator`)
- React page: `resources/js/Pages/Admin/IdGenerator.jsx`
- GD composition: `app/Services/IdCardGenerator.php`
- Templates & fonts: `public/tools/sp-id-generator/img/`
- Requires PHP GD + FreeType
- Old `/tools/sp-id-generator/` redirects here

### Monthly CSV Allocation (`/admin/tools/monthly-allocation`)
- Generates one row per weekday in selected month
- Columns: `number,datetime,value,refnumber,ads`
- Datetime format: `MMM dd, yyyy h:mm AM` (no leading apostrophe)
- Configurable monthly target (whole pesos) + base weekday amount
- Remaining total assigned to final two weekdays (month-end rule)
- Base auto-reduced if target too low; total always matches target
- Random times (8:00–11:59 AM), refs (100M–199,999,999), random PNG from `MONTHLY_PLAN_AD_DIRECTORY`
- Settings persisted in `helpdesk_settings` table
- Throttled: 3 downloads/minute

### Browser Notifications
- Per-admin settings at `/admin/notifications/settings`
- Task due reminders (enabled by default)
- Polling endpoint at `/admin/notifications`

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_NAME` | Application name | `"MyWorkspace"` |
| `APP_ENV` | Environment | `local` |
| `APP_KEY` | Laravel app key (generate once) | — |
| `APP_DEBUG` | Debug mode | `true` |
| `APP_URL` | Public URL | `http://localhost/helpdesk` |
| `ASSET_URL` | Asset base path | `/helpdesk/public` |
| `APP_TIMEZONE` | Timezone | `Asia/Manila` |
| `DB_CONNECTION` | Primary DB driver | `sqlite` |
| `DB_DATABASE` | SQLite path | `database/database.sqlite` |
| `MYSQL_DATABASE` | Aiven MySQL database name | — |
| `DB_HOST` | Aiven host | — |
| `DB_PORT` | Aiven port | `3306` |
| `DB_USERNAME` | Aiven username | — |
| `DB_PASSWORD` | Aiven password | — |
| `DB_SSL_CA` | Aiven CA cert path | `config/certs/ca.pem` |
| `SESSION_DRIVER` | Session driver | `file` |
| `SESSION_COOKIE` | Cookie name | `myworkspace` |
| `INITIAL_ADMIN_NAME` | First admin name (setup only) | — |
| `INITIAL_ADMIN_EMAIL` | First admin email (setup only) | — |
| `INITIAL_ADMIN_PASSWORD` | First admin password, 12+ chars (setup only) | — |
| `MONTHLY_PLAN_NUMBER` | CSV `number` column value | — |
| `MONTHLY_PLAN_AD_DIRECTORY` | Local path to ad PNGs for CSV | — |

---

## Local Setup

### New Installation

```powershell
# 1. Create SQLite file
if (!(Test-Path database\database.sqlite)) {
    New-Item -ItemType File -Path database\database.sqlite | Out-Null
}

# 2. Install & build
composer install
npm install
npm run build

# 3. Generate key & migrate
php artisan key:generate
php artisan migrate --force

# 4. Create first admin (one-time)
# Set INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD in .env first
php bin/setup.php
# Credentials are removed from .env after setup
```

### Existing Installation (Upgrade)

```powershell
# Preserve existing .env and database/database.sqlite
composer install
npm install
npm run build

# Run username/role migration (idempotent)
php bin/migrate.php

# Standard migrations
php artisan migrate --force

# ⚠️ Never run migrate:fresh or db:wipe — they destroy data
```

### Development

```bash
# All services (server, queue, logs, Vite)
composer dev

# Or individually:
php artisan serve
php artisan queue:listen --tries=1 --timeout=0
php artisan pail --timeout=0
npm run dev
```

### Testing

```bash
composer test
# or
php artisan test
```

---

## Key Implementation Details

### Routing
All admin routes under `/admin` prefix with `admin` middleware (`EnsureAdmin`).
- Root `/` and `/admin/login` → AuthController::show
- POST `/admin/login` → AuthController::login (throttled 5/min)
- POST `/logout` → AuthController::logout

### Middleware
- `admin` — ensures authenticated admin user
- `throttle:5,1` — login attempts
- `throttle:3,1` — CSV downloads

### Controllers
| Controller | Routes |
|------------|--------|
| `AuthController` | login, logout |
| `DashboardController` | admin dashboard |
| `AccomplishmentController` | CRUD tasks |
| `UserController` | CRUD admins, toggle status |
| `DatabaseController` | full DB toolkit |
| `IdGeneratorController` | ID cards (generate, preview, download) |
| `MonthlyAllocationController` | CSV download |
| `BrowserNotificationController` | poll, settings |
| `ProfileController` | update own profile |

### Services
- `DatabaseSyncService` — Aiven ↔ SQLite clone logic, preview, snapshots
- `IdCardGenerator` — GD-based card composition

### Frontend
- Entry: `resources/js/app.jsx`
- Pages: `resources/js/Pages/Admin/*.jsx`
- Components: `resources/js/Components/`
- CSS: `resources/css/app.css` (TailwindCSS 4 via Vite plugin)
- Build: `npm run build` → `public/build/`

---

## Important Notes

1. **SQLite is primary** — Aiven MySQL is backup only, not for app traffic
2. **Email not unique** — Multiple admins can share an email address
3. **Usernames are unique** — Generated for staff during `bin/migrate.php`
4. **Destructive migrations** — Several migrations permanently delete tables; they **cannot be rolled back**
5. **Cache uses file driver** — `CACHE_STORE=file` (not database)
6. **Private data** — Snapshots, exports, `.sqlite` files contain password hashes; keep secure
7. **PHP GD + FreeType required** — For SP ID Generator cards

---

## File Structure Highlights

```
helpdesk/
├── app/
│   ├── Http/Controllers/       # All controllers
│   ├── Http/Middleware/        # EnsureAdmin, HandleInertiaRequests
│   ├── Models/User.php         # Admin model (name, email, password)
│   ├── Services/
│   │   ├── DatabaseSyncService.php
│   │   └── IdCardGenerator.php
│   └── Providers/AppServiceProvider.php
├── bin/
│   ├── migrate.php             # Username/role schema migration (MySQL-aware)
│   └── setup.php               # First admin creation
├── config/                     # Laravel config
├── database/
│   ├── migrations/             # All migrations (including removed features)
│   ├── database.sqlite         # Gitignored primary DB
│   └── factories/seeders/
├── public/
│   ├── tools/sp-id-generator/img/  # ID card templates & fonts
│   └── build/                  # Vite output (gitignored)
├── resources/
│   ├── js/Pages/Admin/         # Inertia React pages
│   ├── js/Components/          # Shared React components
│   └── css/app.css             # Tailwind entry
├── routes/web.php              # All routes
├── storage/app/private/database-backups/  # Private snapshots (gitignored)
├── .env                        # Gitignored
├── composer.json
├── package.json
├── vite.config.js
└── artisan
```