# SmartHMS — Complete Implementation Prompt for AI Agent (Codex) v3.0

> **Read this entire document before writing a single line of code.**
> **Paste the SYSTEM CONTEXT block first in every new session. Then paste one Phase at a time.**
> **This is the master reference. Follow it exactly.**

---

## ─────────────────────────────────────────
## SYSTEM CONTEXT — PASTE THIS FIRST, ALWAYS
## ─────────────────────────────────────────

You are building **Smart HMS** — a full Hospitality Management System for
Ethiopian Hospitality Enterprises, developed by iLink Software Solutions PLC.

### What this system does
Smart HMS manages a multi-service Ethiopian hospitality business that runs
a restaurant, bar, butcher shop, grocery store, and hotel rooms all under
one roof. Staff use it from their browser on laptops, tablets, and phones.
There is no dedicated server hardware on-site.

### Technology Stack — Use Exactly These, No Substitutions

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Frontend | React.js | v18 | PWA-enabled (installable on tablets) |
| Frontend Styling | Tailwind CSS | v3 | All styling via Tailwind utility classes |
| Frontend State | Zustand | Latest | Global state: auth, cart, orders |
| Frontend Data Fetching | React Query (@tanstack/react-query) | v5 | All API calls, caching, loading/error states |
| Frontend Routing | React Router | v6 | Client-side routing with role-based guards |
| Backend | Node.js + Express.js | Node v18 LTS | REST API server |
| Real-time | Socket.io | v4.x | Order routing: waiter → kitchen, waiter → bar |
| Database | MySQL | v8.x | All data |
| ORM | Sequelize | v6 | Database models + migrations |
| Auth | JWT + bcryptjs | Latest | Access tokens 15min, refresh tokens 30 days |
| Hosting | Yegara Host cPanel | — | Standard shared hosting — NO VPS, NO Linux CLI |
| Deployment method | cPanel File Manager + Node.js App Setup | — | No SSH, no PM2, no Nginx config needed |

### What is NOT in this version (will be added later)
- ❌ Amharic language — build everything in English only. Use a `t('key')` translation wrapper function throughout so Amharic can be added later by just adding a translation file.
- ❌ Offline mode / IndexedDB / sync_queue — build online-first. If the internet drops, show a clear "No internet connection — please reconnect" error message. Nothing more.
- ❌ Visual floor map for tables — replaced with a simple dropdown/list system (see Step 7).
- ❌ Thermal printer integration — receipts display on screen and use `window.print()` with print CSS. Printer hardware compatibility is handled later.
- ❌ Telebirr/CBE API integration — manual reference number entry only.

### Deployment Environment — Yegara cPanel (NOT VPS)
- All three parts (frontend, backend, database) run on one Yegara cPanel shared hosting account.
- Frontend: React build files uploaded to a folder served by cPanel (public_html or subdomain).
- Backend: Node.js app created via cPanel "Setup Node.js App" tool. No Nginx, no PM2.
- Database: MySQL database created via cPanel "MySQL Databases" tool.
- SSL: Let's Encrypt via cPanel — free, one-click setup.
- cPanel manages the Node.js process automatically. If the app crashes, restart it from cPanel.

### API Base URL
Every single backend route must be prefixed: `/api/v1/`
Example: login is `POST /api/v1/auth/login` — never just `/api/auth/login`

### Language
All UI text, labels, buttons, error messages, and receipts are in **English only**.
Every string must use a translation wrapper: `t('label_key')` that returns the English string now.
This makes adding Amharic later a matter of adding one translation file, not rewriting components.

### Currency
All amounts are in **Ethiopian Birr (ETB)**. Format as `ETB 1,250.00` throughout.

### User Roles and What They Can Access
There are 9 roles. The backend enforces these with RBAC middleware on every route.

| Role | What they do | What they can access |
|---|---|---|
| superadmin | Full system control | Everything |
| manager | Day-to-day management | Everything except user deletion |
| cashier | Handles billing and payments | POS, Billing, Rooms checkout, Reports (daily only) |
| waiter | Takes restaurant orders | Tables, Order entry, their own orders |
| kitchen | Manages kitchen display | KDS screen, view orders only |
| bar | Manages bar display | Bar display screen, view bar orders only |
| butcher | Manages butcher sales | Butcher POS only |
| grocery | Manages grocery sales | Grocery POS, Inventory (their module) |
| receptionist | Manages hotel rooms | Rooms, Bookings, Guest charges |

### Modules Being Built (7 total)
1. **POS & Billing** — create orders, generate bills, process payments, print receipts
2. **Restaurant & Table Management** — table list with status, waiter order entry, KDS
3. **Bar Module** — bar order routing, bar display screen, beverage inventory
4. **Butcher Module** — per-kg pricing, search-based item selection, daily summary
5. **Grocery Module** — search-based POS, packaged goods, supplier management
6. **Hotel Rooms Module** — booking, check-in, check-out, guest billing tab
7. **Inventory, Reporting & Analytics** — stock management, revenue dashboards, close day

---

## ─────────────────────────────────────────
## PHASE 1 — Project Setup & Database (Weeks 1–4)
## ─────────────────────────────────────────

### STEP 1: Create the Project Folder Structure

Create this exact folder structure. Do not deviate from it.

```
/smarthms/
│
├── /frontend/                          ← React.js v18 PWA application
│   ├── /public/
│   │   └── manifest.json               ← PWA manifest (for tablet install)
│   └── /src/
│       ├── /pages/                     ← One file per screen
│       │   ├── LoginPage.jsx
│       │   ├── AdminDashboard.jsx
│       │   ├── POSPage.jsx
│       │   ├── WaiterPage.jsx
│       │   ├── KDSPage.jsx             ← Kitchen Display System
│       │   ├── BarDisplayPage.jsx
│       │   ├── ButcherPage.jsx
│       │   ├── GroceryPage.jsx
│       │   ├── RoomsPage.jsx
│       │   └── ReportsPage.jsx
│       ├── /components/                ← Reusable UI components
│       │   ├── /layout/
│       │   │   ├── Sidebar.jsx
│       │   │   ├── TopBar.jsx
│       │   │   └── ProtectedRoute.jsx  ← Role-based route guard
│       │   ├── /common/
│       │   │   ├── Button.jsx
│       │   │   ├── Modal.jsx
│       │   │   ├── SearchInput.jsx
│       │   │   ├── Badge.jsx           ← Status badges (green/red/yellow)
│       │   │   ├── LoadingSpinner.jsx
│       │   │   └── OfflineBanner.jsx   ← Shows when navigator.onLine = false
│       │   ├── /pos/
│       │   │   ├── MenuItemCard.jsx
│       │   │   ├── OrderItemRow.jsx
│       │   │   ├── BillSummary.jsx
│       │   │   └── ReceiptView.jsx
│       │   ├── /tables/
│       │   │   ├── TableCard.jsx       ← Shows table number + status badge
│       │   │   └── TableSelector.jsx   ← Dropdown to select a table
│       │   ├── /kds/
│       │   │   └── OrderCard.jsx       ← KDS order card (Pending/Preparing/Ready)
│       │   └── /rooms/
│       │       ├── RoomCard.jsx
│       │       └── BookingForm.jsx
│       ├── /store/                     ← Zustand global state stores
│       │   ├── authStore.js            ← user, accessToken, isAuthenticated, login(), logout()
│       │   ├── cartStore.js            ← current order items being built
│       │   └── socketStore.js          ← socket instance, connection status
│       ├── /hooks/                     ← React Query data hooks
│       │   ├── useAuth.js
│       │   ├── useOrders.js
│       │   ├── useMenu.js
│       │   ├── useTables.js
│       │   ├── useBilling.js
│       │   ├── useRooms.js
│       │   ├── useInventory.js
│       │   └── useReports.js
│       ├── /utils/
│       │   ├── i18n.js                 ← Translation wrapper: t('key') returns English string
│       │   ├── formatCurrency.js       ← formatETB(amount) returns "ETB 1,250.00"
│       │   ├── api.js                  ← Axios instance with base URL + auth interceptors
│       │   └── socket.js              ← Socket.io client setup
│       ├── App.jsx                     ← Router setup + QueryClientProvider + role guards
│       └── index.js                    ← Entry point
│
└── /backend/
    ├── /routes/                        ← Express route files
    │   ├── auth.js                     ← /api/v1/auth/*
    │   ├── users.js                    ← /api/v1/users/*
    │   ├── menu.js                     ← /api/v1/menu-items/*, /api/v1/categories/*
    │   ├── tables.js                   ← /api/v1/tables/*
    │   ├── orders.js                   ← /api/v1/orders/*
    │   ├── bills.js                    ← /api/v1/bills/*
    │   ├── payments.js                 ← /api/v1/payments/*
    │   ├── receipts.js                 ← /api/v1/receipts/*
    │   ├── rooms.js                    ← /api/v1/rooms/*
    │   ├── bookings.js                 ← /api/v1/bookings/*
    │   ├── inventory.js                ← /api/v1/inventory/*
    │   ├── suppliers.js                ← /api/v1/suppliers/*
    │   └── reports.js                  ← /api/v1/reports/*
    ├── /models/                        ← Sequelize model files (one per table)
    ├── /middleware/
    │   ├── auth.js                     ← Verifies JWT Bearer token, attaches req.user
    │   ├── rbac.js                     ← checkRole(...roles) middleware factory
    │   └── audit.js                    ← Logs every write action to audit_log table
    ├── /sockets/
    │   ├── orderEvents.js              ← order:new, order:updated, item:status events
    │   ├── tableEvents.js              ← table:status event
    │   └── index.js                    ← Socket.io init, room management
    ├── /migrations/                    ← One Sequelize migration file per table
    ├── /seeders/                       ← Initial data: roles, superadmin, categories, room types
    ├── /config/
    │   ├── database.js                 ← Sequelize instance with connection pool
    │   └── socket.js                   ← Socket.io server config
    ├── server.js                       ← Express app entry point
    └── .env                            ← Environment variables (never commit this)
```

### STEP 2: Bootstrap Commands

Run these commands to create and configure the project:

```bash
# ── FRONTEND ──────────────────────────────────────────────
# Create React app with PWA template (enables service worker + manifest)
npx create-react-app frontend --template cra-template-pwa
cd frontend

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install all frontend dependencies
npm install \
  zustand \
  @tanstack/react-query \
  react-router-dom \
  axios \
  socket.io-client \
  recharts

# ── TAILWIND CONFIG ───────────────────────────────────────
# In frontend/tailwind.config.js, replace content with:
# module.exports = {
#   content: ["./src/**/*.{js,jsx,ts,tsx}"],
#   theme: { extend: {} },
#   plugins: [],
# }

# In frontend/src/index.css, replace everything with:
# @tailwind base;
# @tailwind components;
# @tailwind utilities;

# ── BACKEND ───────────────────────────────────────────────
cd ..
mkdir backend && cd backend
npm init -y

# Install all backend dependencies
npm install \
  express \
  sequelize \
  mysql2 \
  socket.io \
  jsonwebtoken \
  bcryptjs \
  dotenv \
  cors \
  helmet \
  morgan \
  express-validator

# Install dev dependencies
npm install --save-dev nodemon sequelize-cli

# Create .sequelizerc file for migration paths
# (see Step 3 for content)
```

Create `backend/.sequelizerc`:
```javascript
const path = require('path');
module.exports = {
  'config': path.resolve('config', 'database.js'),
  'models-path': path.resolve('models'),
  'seeders-path': path.resolve('seeders'),
  'migrations-path': path.resolve('migrations'),
};
```

Create `backend/package.json` scripts section:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "migrate": "sequelize-cli db:migrate",
    "seed": "sequelize-cli db:seed:all",
    "migrate:undo": "sequelize-cli db:migrate:undo:all"
  }
}
```

### STEP 3: Environment Variables

Create `backend/.env` with these exact keys:

```env
# Server
PORT=5000
NODE_ENV=development

# Database — fill in values from Yegara cPanel MySQL setup
DB_HOST=localhost
DB_USER=your_cpanel_mysql_username
DB_PASS=your_cpanel_mysql_password
DB_NAME=your_cpanel_database_name
DB_PORT=3306

# Connection Pool
DB_POOL_MAX=10
DB_POOL_MIN=2
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000

# JWT
JWT_SECRET=replace_with_a_random_256bit_string_minimum_32_characters
JWT_REFRESH_SECRET=replace_with_a_different_random_256bit_string
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Frontend URL (for CORS)
FRONTEND_URL=https://yourdomain.com
```

Create `backend/config/database.js`:

```javascript
require('dotenv').config();

// This file is used by both Sequelize CLI (migrations) and the app
module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
    },
    logging: console.log,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
    },
    logging: false,
  },
};
```

### STEP 4: Database Schema — All Tables

Create one Sequelize migration file per table using `sequelize-cli migration:generate --name create-tablename`.

Rules that apply to ALL tables:
- Every table has `id` (INTEGER, autoIncrement, primaryKey), `created_at`, `updated_at`
- Tables marked ⚡ also have `deleted_at` and use Sequelize `paranoid: true` for soft deletes
- Use `utf8mb4` charset and `utf8mb4_unicode_ci` collation on all string columns
- All foreign keys must have corresponding indexes

---

**TABLE: users** ⚡
```
id              INTEGER         PRIMARY KEY AUTO_INCREMENT
name            VARCHAR(100)    NOT NULL
email           VARCHAR(100)    UNIQUE, nullable
pin_hash        VARCHAR(255)    nullable  ← bcrypt hash of 4-6 digit PIN
password_hash   VARCHAR(255)    nullable  ← bcrypt hash of text password
role            ENUM('superadmin','manager','cashier','waiter',
                     'kitchen','bar','butcher','grocery','receptionist')
                NOT NULL
language_pref   ENUM('en','am') DEFAULT 'en'   ← for future Amharic support
refresh_token_hash VARCHAR(255) nullable        ← hashed refresh token stored here
is_active       BOOLEAN         DEFAULT true
created_at      DATETIME
updated_at      DATETIME
deleted_at      DATETIME        nullable        ← soft delete
```

**TABLE: categories**
```
id              INTEGER         PRIMARY KEY AUTO_INCREMENT
name_en         VARCHAR(100)    NOT NULL        ← English name
name_am         VARCHAR(100)    nullable        ← Amharic name (for future)
module_type     ENUM('restaurant','bar','butcher','grocery')  NOT NULL
sort_order      INTEGER         DEFAULT 0
created_at      DATETIME
updated_at      DATETIME
```

**TABLE: menu_items** ⚡
```
id              INTEGER         PRIMARY KEY AUTO_INCREMENT
category_id     INTEGER         NOT NULL  FK → categories.id
name_en         VARCHAR(150)    NOT NULL
name_am         VARCHAR(150)    nullable
price           DECIMAL(10,2)   NOT NULL          ← regular price in ETB
happy_hour_price DECIMAL(10,2)  nullable          ← bar module only
happy_hour_start TIME           nullable          ← e.g. '17:00:00'
happy_hour_end   TIME           nullable          ← e.g. '19:00:00'
unit            ENUM('piece','kg','g','pack','bottle','litre')  DEFAULT 'piece'
is_available    BOOLEAN         DEFAULT true
module          ENUM('restaurant','bar','butcher','grocery')  NOT NULL
deleted_at      DATETIME        nullable
created_at      DATETIME
updated_at      DATETIME
INDEX: (category_id), (module), (is_available)
```

**TABLE: modifiers**
```
id              INTEGER         PRIMARY KEY AUTO_INCREMENT
menu_item_id    INTEGER         NOT NULL  FK → menu_items.id
name_en         VARCHAR(100)    NOT NULL
name_am         VARCHAR(100)    nullable
price_delta     DECIMAL(10,2)   DEFAULT 0.00  ← positive = extra charge, 0 = free
created_at      DATETIME
updated_at      DATETIME
INDEX: (menu_item_id)
```

**TABLE: tables**
```
id              INTEGER         PRIMARY KEY AUTO_INCREMENT
label           VARCHAR(50)     NOT NULL    ← e.g. "Table 1", "Table 2", "VIP 1"
section         VARCHAR(100)    nullable    ← e.g. "Main Hall", "Outdoor", "VIP"
capacity        INTEGER         DEFAULT 4
status          ENUM('available','occupied','reserved')  DEFAULT 'available'
created_at      DATETIME
updated_at      DATETIME
```

Note: No x_pos/y_pos coordinates needed. Tables are managed as a simple list.

**TABLE: orders** ⚡
```
id              INTEGER         PRIMARY KEY AUTO_INCREMENT
table_id        INTEGER         nullable    FK → tables.id
                                ← nullable because bar/butcher/grocery orders have no table
user_id         INTEGER         NOT NULL    FK → users.id  ← the waiter/staff who created it
status          ENUM('pending','preparing','ready','served','billed','cancelled')
                DEFAULT 'pending'
type            ENUM('restaurant','bar','butcher','grocery','room')  NOT NULL
notes           TEXT            nullable
deleted_at      DATETIME        nullable
created_at      DATETIME
updated_at      DATETIME
INDEX: (table_id), (user_id), (status), (type)
```

**TABLE: order_items**
```
id              INTEGER         PRIMARY KEY AUTO_INCREMENT
order_id        INTEGER         NOT NULL    FK → orders.id
menu_item_id    INTEGER         NOT NULL    FK → menu_items.id
quantity        DECIMAL(10,3)   NOT NULL    DEFAULT 1
                ← DECIMAL not INTEGER because butcher sells 1.75 kg
weight_kg       DECIMAL(8,3)    nullable    ← only for butcher module items
unit_price      DECIMAL(10,2)   NOT NULL    ← price at time of order (not live price)
modifier_ids    JSON            nullable    ← array of modifier IDs applied
status          ENUM('pending','preparing','ready')  DEFAULT 'pending'
notes           TEXT            nullable
created_at      DATETIME
updated_at      DATETIME
INDEX: (order_id), (menu_item_id)
```

**TABLE: bills** ⚡
```
id              INTEGER         PRIMARY KEY AUTO_INCREMENT
order_id        INTEGER         NOT NULL    FK → orders.id
table_id        INTEGER         nullable    FK → tables.id
subtotal        DECIMAL(10,2)   NOT NULL
discount_amount DECIMAL(10,2)   DEFAULT 0.00
tax_amount      DECIMAL(10,2)   DEFAULT 0.00
total_amount    DECIMAL(10,2)   NOT NULL    ← subtotal - discount + tax
status          ENUM('open','paid','voided')  DEFAULT 'open'
created_by      INTEGER         NOT NULL    FK → users.id
deleted_at      DATETIME        nullable
created_at      DATETIME
updated_at      DATETIME
INDEX: (order_id), (status)
```

**TABLE: payments**
```
id              INTEGER         PRIMARY KEY AUTO_INCREMENT
bill_id         INTEGER         NOT NULL    FK → bills.id
method          ENUM('cash','telebirr','cbe_birr')  NOT NULL
amount          DECIMAL(10,2)   NOT NULL
reference_no    VARCHAR(100)    nullable    ← manual entry for Telebirr/CBE
confirmed_by    INTEGER         NOT NULL    FK → users.id  ← cashier
created_at      DATETIME
updated_at      DATETIME
INDEX: (bill_id)
```

**TABLE: receipts**
```
id              INTEGER         PRIMARY KEY AUTO_INCREMENT
bill_id         INTEGER         NOT NULL    FK → bills.id
receipt_number  VARCHAR(50)     UNIQUE NOT NULL  ← auto-generated e.g. "RCP-20260518-0042"
language        ENUM('en','am') DEFAULT 'en'
printed_at      DATETIME        nullable
created_at      DATETIME
updated_at      DATETIME
INDEX: (bill_id)
```

**TABLE: room_types**
```
id              INTEGER         PRIMARY KEY AUTO_INCREMENT
name            VARCHAR(100)    NOT NULL    ← e.g. "Standard", "Deluxe", "Suite"
description     TEXT            nullable
base_rate       DECIMAL(10,2)   NOT NULL    ← rate per night in ETB
max_occupancy   INTEGER         DEFAULT 2
created_at      DATETIME
updated_at      DATETIME
```

**TABLE: rooms** ⚡
```
id              INTEGER         PRIMARY KEY AUTO_INCREMENT
room_number     VARCHAR(20)     NOT NULL UNIQUE  ← e.g. "101", "202", "VIP-1"
room_type_id    INTEGER         NOT NULL    FK → room_types.id
floor           INTEGER         DEFAULT 1
status          ENUM('available','occupied','maintenance')  DEFAULT 'available'
amenities       JSON            nullable    ← e.g. ["WiFi","TV","AC"]
deleted_at      DATETIME        nullable
created_at      DATETIME
updated_at      DATETIME
INDEX: (status), (room_type_id)
```

**TABLE: bookings** ⚡
```
id              INTEGER         PRIMARY KEY AUTO_INCREMENT
room_id         INTEGER         NOT NULL    FK → rooms.id
guest_name      VARCHAR(150)    NOT NULL
guest_phone     VARCHAR(20)     NOT NULL
check_in        DATE            NOT NULL
check_out       DATE            NOT NULL
rate_per_night  DECIMAL(10,2)   NOT NULL    ← locked at time of booking
total_amount    DECIMAL(10,2)   nullable    ← calculated at checkout
status          ENUM('confirmed','checked_in','checked_out','cancelled')
                DEFAULT 'confirmed'
created_by      INTEGER         NOT NULL    FK → users.id
deleted_at      DATETIME        nullable
created_at      DATETIME
updated_at      DATETIME
INDEX: (room_id), (status), (check_in), (check_out)
```

**TABLE: guest_charges**
```
id              INTEGER         PRIMARY KEY AUTO_INCREMENT
booking_id      INTEGER         NOT NULL    FK → bookings.id
description     VARCHAR(200)    NOT NULL    ← e.g. "Room Service - Breakfast"
amount          DECIMAL(10,2)   NOT NULL
charged_by      INTEGER         NOT NULL    FK → users.id
charged_at      DATETIME        NOT NULL    DEFAULT CURRENT_TIMESTAMP
created_at      DATETIME
updated_at      DATETIME
INDEX: (booking_id)
```

**TABLE: inventory_items**
```
id              INTEGER         PRIMARY KEY AUTO_INCREMENT
name_en         VARCHAR(150)    NOT NULL
name_am         VARCHAR(150)    nullable
module          ENUM('restaurant','bar','butcher','grocery')  NOT NULL
unit            VARCHAR(50)     NOT NULL    ← e.g. "kg", "bottle", "pack", "piece"
current_stock   DECIMAL(10,3)   DEFAULT 0
min_threshold   DECIMAL(10,3)   DEFAULT 0   ← reorder alert fires below this
cost_price      DECIMAL(10,2)   nullable
created_at      DATETIME
updated_at      DATETIME
INDEX: (module)
```

**TABLE: stock_movements**
```
id              INTEGER         PRIMARY KEY AUTO_INCREMENT
inventory_item_id INTEGER       NOT NULL    FK → inventory_items.id
delta           DECIMAL(10,3)   NOT NULL    ← positive = stock IN, negative = stock OUT
reason          VARCHAR(200)    NOT NULL    ← e.g. "Sale", "Supplier delivery", "Manual adjustment"
reference_id    INTEGER         nullable    ← order_id or booking_id that caused movement
user_id         INTEGER         NOT NULL    FK → users.id
created_at      DATETIME
updated_at      DATETIME
INDEX: (inventory_item_id), (created_at)
```

**TABLE: suppliers**
```
id              INTEGER         PRIMARY KEY AUTO_INCREMENT
name            VARCHAR(150)    NOT NULL
contact_phone   VARCHAR(20)     nullable
email           VARCHAR(100)    nullable
items_supplied  TEXT            nullable    ← free text description
module          ENUM('restaurant','bar','butcher','grocery')  NOT NULL
created_at      DATETIME
updated_at      DATETIME
```

**TABLE: daily_summaries**
```
id              INTEGER         PRIMARY KEY AUTO_INCREMENT
date            DATE            NOT NULL UNIQUE
total_revenue   DECIMAL(12,2)   DEFAULT 0
total_orders    INTEGER         DEFAULT 0
cash_total      DECIMAL(12,2)   DEFAULT 0
telebirr_total  DECIMAL(12,2)   DEFAULT 0
cbe_total       DECIMAL(12,2)   DEFAULT 0
revenue_restaurant DECIMAL(12,2) DEFAULT 0
revenue_bar     DECIMAL(12,2)   DEFAULT 0
revenue_butcher DECIMAL(12,2)   DEFAULT 0
revenue_grocery DECIMAL(12,2)   DEFAULT 0
revenue_rooms   DECIMAL(12,2)   DEFAULT 0
physical_cash_count DECIMAL(12,2) nullable  ← entered by manager at close
cash_variance   DECIMAL(12,2)   nullable    ← system cash - physical count
closed_by       INTEGER         nullable    FK → users.id
closed_at       DATETIME        nullable
created_at      DATETIME
updated_at      DATETIME
```

**TABLE: audit_log**
```
id              INTEGER         PRIMARY KEY AUTO_INCREMENT
user_id         INTEGER         NOT NULL    FK → users.id
action          VARCHAR(100)    NOT NULL    ← e.g. "CREATE_ORDER", "VOID_BILL", "LOGIN"
entity          VARCHAR(100)    NOT NULL    ← table name e.g. "orders", "bills"
entity_id       INTEGER         nullable    ← ID of affected record
payload         JSON            nullable    ← snapshot of what changed
ip_address      VARCHAR(45)     nullable
created_at      DATETIME
INDEX: (user_id), (created_at), (entity)
```

### STEP 5: Utility Files Setup

**`frontend/src/utils/i18n.js`** — Translation wrapper (English now, Amharic later):
```javascript
// Translation strings — English only for now.
// To add Amharic later: add an 'am' object with the same keys and switch based on user language.
const translations = {
  en: {
    // Auth
    'login.title': 'Smart HMS Login',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.pin': 'PIN',
    'login.submit': 'Login',
    'login.toggle_pin': 'Use PIN instead',
    'login.toggle_password': 'Use Password instead',
    // Navigation
    'nav.pos': 'POS & Billing',
    'nav.tables': 'Tables',
    'nav.kds': 'Kitchen Display',
    'nav.bar': 'Bar Display',
    'nav.butcher': 'Butcher',
    'nav.grocery': 'Grocery',
    'nav.rooms': 'Rooms',
    'nav.reports': 'Reports',
    'nav.logout': 'Logout',
    // Tables
    'table.available': 'Available',
    'table.occupied': 'Occupied',
    'table.reserved': 'Reserved',
    'table.select': 'Select Table',
    // Orders
    'order.new': 'New Order',
    'order.send': 'Send Order',
    'order.status.pending': 'Pending',
    'order.status.preparing': 'Preparing',
    'order.status.ready': 'Ready',
    'order.status.served': 'Served',
    // Billing
    'bill.generate': 'Generate Bill',
    'bill.subtotal': 'Subtotal',
    'bill.discount': 'Discount',
    'bill.tax': 'Tax',
    'bill.total': 'Total',
    'bill.payment_method': 'Payment Method',
    'bill.cash': 'Cash',
    'bill.telebirr': 'Telebirr',
    'bill.cbe': 'CBE Birr',
    'bill.reference': 'Reference Number',
    'bill.confirm': 'Confirm Payment',
    'bill.split': 'Split Bill',
    'bill.void': 'Void Bill',
    'bill.print': 'Print Receipt',
    // Common
    'common.search': 'Search...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.no_results': 'No results found',
    'common.offline': 'No internet connection — please reconnect',
    'common.error': 'Something went wrong. Please try again.',
    // Rooms
    'rooms.checkin': 'Check In',
    'rooms.checkout': 'Check Out',
    'rooms.add_charge': 'Add Charge',
    'rooms.guest_name': 'Guest Name',
    'rooms.guest_phone': 'Guest Phone',
    'rooms.check_in_date': 'Check-in Date',
    'rooms.check_out_date': 'Check-out Date',
    // Reports
    'reports.daily': 'Daily Summary',
    'reports.revenue': 'Revenue',
    'reports.close_day': 'Close Day',
    'reports.cash_count': 'Physical Cash Count',
  }
};

const currentLang = 'en'; // Will be dynamic when Amharic is added

export function t(key) {
  return translations[currentLang][key] || key;
}
```

**`frontend/src/utils/formatCurrency.js`**:
```javascript
// Format a number as Ethiopian Birr
// Usage: formatETB(1250) → "ETB 1,250.00"
export function formatETB(amount) {
  if (amount === null || amount === undefined) return 'ETB 0.00';
  return 'ETB ' + Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
```

**`frontend/src/utils/api.js`** — Axios instance with auth interceptors:
```javascript
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://yourdomain.com',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401: try refresh, then logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        await useAuthStore.getState().refreshToken();
        const newToken = useAuthStore.getState().accessToken;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

**`frontend/src/utils/socket.js`** — Socket.io client:
```javascript
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'https://yourdomain.com';

let socket = null;

export function getSocket() {
  return socket;
}

export function connectSocket(token) {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'], // try WebSocket first, fall back to polling
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => console.log('Socket connected:', socket.id));
  socket.on('disconnect', () => console.log('Socket disconnected'));
  socket.on('connect_error', (err) => console.error('Socket error:', err.message));

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
```

---

## ─────────────────────────────────────────
## PHASE 2 — Backend Core (Weeks 5–12)
## ─────────────────────────────────────────

### STEP 6: Express Server Entry Point

Create `backend/server.js`:

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const { Sequelize } = require('sequelize');
const config = require('./config/database');
const initSockets = require('./sockets');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

// Make io accessible in routes via req.io
app.use((req, res, next) => { req.io = io; next(); });

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint — used by monitoring and go-live checklist
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes — all prefixed /api/v1/
app.use('/api/v1/auth',      require('./routes/auth'));
app.use('/api/v1/users',     require('./routes/users'));
app.use('/api/v1/menu-items',require('./routes/menu'));
app.use('/api/v1/categories',require('./routes/menu'));
app.use('/api/v1/tables',    require('./routes/tables'));
app.use('/api/v1/orders',    require('./routes/orders'));
app.use('/api/v1/bills',     require('./routes/bills'));
app.use('/api/v1/payments',  require('./routes/payments'));
app.use('/api/v1/receipts',  require('./routes/receipts'));
app.use('/api/v1/rooms',     require('./routes/rooms'));
app.use('/api/v1/bookings',  require('./routes/bookings'));
app.use('/api/v1/inventory', require('./routes/inventory'));
app.use('/api/v1/suppliers', require('./routes/suppliers'));
app.use('/api/v1/reports',   require('./routes/reports'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Initialize Socket.io event handlers
initSockets(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`SmartHMS API running on port ${PORT}`);
});
```

### STEP 7: Authentication System

**`backend/middleware/auth.js`** — JWT verification:
```javascript
const jwt = require('jsonwebtoken');

module.exports = function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role, name, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

**`backend/middleware/rbac.js`** — Role-based access control:
```javascript
// Usage: router.get('/route', authenticate, checkRole('admin','manager'), handler)
module.exports.checkRole = function checkRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }
    next();
  };
};
```

**`backend/middleware/audit.js`** — Action logging:
```javascript
const { AuditLog } = require('../models');

module.exports = function audit(action, entity) {
  return async (req, res, next) => {
    // Store original json() to intercept the response
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      try {
        if (req.user && res.statusCode < 400) {
          await AuditLog.create({
            user_id: req.user.userId,
            action,
            entity,
            entity_id: data?.id || req.params?.id || null,
            payload: JSON.stringify(req.body).substring(0, 1000), // cap at 1000 chars
            ip_address: req.ip,
          });
        }
      } catch (err) {
        console.error('Audit log failed:', err.message);
        // Never let audit failure break the response
      }
      return originalJson(data);
    };
    next();
  };
};
```

**`backend/routes/auth.js`** — Login, refresh, logout:
```javascript
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const authenticate = require('../middleware/auth');

// Helper: generate token pair
function generateTokens(user) {
  const payload = { userId: user.id, role: user.role, name: user.name };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN, // 15m
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN, // 30d
  });
  return { accessToken, refreshToken };
}

// POST /api/v1/auth/login
// Body: { username, password } OR { username, pin }
router.post('/login', async (req, res) => {
  try {
    const { username, password, pin } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required' });

    const user = await User.findOne({ where: { name: username, is_active: true } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    let valid = false;
    if (pin && user.pin_hash) {
      valid = await bcrypt.compare(String(pin), user.pin_hash);
    } else if (password && user.password_hash) {
      valid = await bcrypt.compare(password, user.password_hash);
    }
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user);

    // Store hashed refresh token
    user.refresh_token_hash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, role: user.role, language_pref: user.language_pref },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/auth/refresh
// Body: { refreshToken }
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.refresh_token_hash) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const valid = await bcrypt.compare(refreshToken, user.refresh_token_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid refresh token' });

    const { accessToken, refreshToken: newRefresh } = generateTokens(user);
    user.refresh_token_hash = await bcrypt.hash(newRefresh, 10);
    await user.save();

    res.json({ accessToken, refreshToken: newRefresh });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// POST /api/v1/auth/logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (user) {
      user.refresh_token_hash = null;
      await user.save();
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

**`frontend/src/store/authStore.js`** — Zustand auth store:
```javascript
import { create } from 'zustand';
import api from '../utils/api';
import { connectSocket, disconnectSocket } from '../utils/socket';

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  login: async (credentials) => {
    // credentials: { username, password } or { username, pin }
    const res = await api.post('/api/v1/auth/login', credentials);
    const { accessToken, refreshToken, user } = res.data;

    // Store refresh token in localStorage (access token stays in memory only)
    localStorage.setItem('refreshToken', refreshToken);

    set({ user, accessToken, isAuthenticated: true });

    // Connect socket with the new token
    connectSocket(accessToken);

    // Schedule access token refresh 2 minutes before 15min expiry (at 13 minutes)
    get()._scheduleRefresh();

    return user;
  },

  logout: () => {
    api.post('/api/v1/auth/logout').catch(() => {});
    localStorage.removeItem('refreshToken');
    disconnectSocket();
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  refreshToken: async () => {
    const storedRefresh = localStorage.getItem('refreshToken');
    if (!storedRefresh) throw new Error('No refresh token');

    const res = await api.post('/api/v1/auth/refresh', { refreshToken: storedRefresh });
    const { accessToken, refreshToken } = res.data;

    localStorage.setItem('refreshToken', refreshToken);
    set({ accessToken });

    get()._scheduleRefresh();
    return accessToken;
  },

  // Auto-refresh access token 2 minutes before expiry (13 minutes after issue)
  _refreshTimer: null,
  _scheduleRefresh: () => {
    if (get()._refreshTimer) clearTimeout(get()._refreshTimer);
    const timer = setTimeout(() => {
      get().refreshToken().catch(() => get().logout());
    }, 13 * 60 * 1000); // 13 minutes
    set({ _refreshTimer: timer });
  },

  // Called on app load to restore session from localStorage
  rehydrate: async () => {
    const storedRefresh = localStorage.getItem('refreshToken');
    if (!storedRefresh) return;
    try {
      await get().refreshToken();
    } catch {
      get().logout();
    }
  },
}));
```

### STEP 8: Table Management (Simple List — No Floor Map)

**Important:** Tables are managed as a numbered list only. There is NO visual floor map, NO drag-and-drop, NO coordinate positioning. The waiter simply selects a table from a dropdown.

**`backend/routes/tables.js`**:
```
GET    /api/v1/tables              → Return all tables with status [All authenticated]
POST   /api/v1/tables              → Create a new table [superadmin, manager]
PATCH  /api/v1/tables/:id/status   → Update table status → emit table:status socket event [waiter, cashier, manager]
DELETE /api/v1/tables/:id          → Delete table [superadmin, manager]
```

When table status is updated, the server emits:
```javascript
req.io.emit('table:status', { tableId: id, status, label });
```

**`frontend/src/components/tables/TableSelector.jsx`** — Dropdown for waiters:
```jsx
// This component shows a dropdown of all tables with their current status.
// The waiter selects a table before placing an order.
// Green = available, Red = occupied, Yellow = reserved

import { t } from '../../utils/i18n';

export function TableSelector({ value, onChange, tables = [] }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {t('table.select')}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">{t('table.select')}...</option>
        {tables.map((table) => (
          <option key={table.id} value={table.id}>
            {table.label}
            {table.section ? ` (${table.section})` : ''}
            {' — '}
            {table.status === 'available' ? '🟢 Available' :
             table.status === 'occupied'  ? '🔴 Occupied' :
                                            '🟡 Reserved'}
          </option>
        ))}
      </select>
    </div>
  );
}
```

**`frontend/src/components/tables/TableCard.jsx`** — Visual card for admin table management page:
```jsx
// Shows a table as a card with its label, section, capacity, and status badge.
// Admin uses this to see all tables and change their status.
import { t } from '../../utils/i18n';

const statusColors = {
  available: 'bg-green-100 text-green-800 border-green-200',
  occupied:  'bg-red-100 text-red-800 border-red-200',
  reserved:  'bg-yellow-100 text-yellow-800 border-yellow-200',
};

export function TableCard({ table, onStatusChange }) {
  return (
    <div className="border rounded-xl p-4 shadow-sm bg-white flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-bold text-lg">{table.label}</span>
        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${statusColors[table.status]}`}>
          {t(`table.${table.status}`)}
        </span>
      </div>
      {table.section && (
        <span className="text-sm text-gray-500">{table.section}</span>
      )}
      <span className="text-sm text-gray-400">Capacity: {table.capacity}</span>
      <select
        value={table.status}
        onChange={(e) => onStatusChange(table.id, e.target.value)}
        className="mt-1 text-sm border rounded px-2 py-1"
      >
        <option value="available">Available</option>
        <option value="occupied">Occupied</option>
        <option value="reserved">Reserved</option>
      </select>
    </div>
  );
}
```

### STEP 9: POS & Billing Module

**`backend/routes/orders.js`** — All order endpoints:
```
POST   /api/v1/orders              → Create order [waiter, cashier, butcher, grocery, receptionist]
GET    /api/v1/orders              → List orders (filter by status, type, table) [authenticated]
GET    /api/v1/orders/:id          → Get single order with all items [authenticated]
PATCH  /api/v1/orders/:id/status   → Update order status [kitchen, bar, waiter, manager]
PATCH  /api/v1/orders/:id/items    → Add/update items on an existing open order [waiter]
DELETE /api/v1/orders/:id          → Cancel order (soft delete) [manager]
```

When a new order is created:
- Save order + order_items to DB
- Emit `order:new` to the correct socket room based on `order.type`:
  - `type = 'restaurant'` → emit to `'kitchen'` room
  - `type = 'bar'` → emit to `'bar'` room
  - Other types → no socket emit needed (butcher/grocery handled at counter)

**`backend/routes/bills.js`**:
```
POST   /api/v1/bills               → Generate bill from order [cashier, manager]
GET    /api/v1/bills/:id           → Get bill with all line items [cashier, manager]
PATCH  /api/v1/bills/:id/void      → Void a bill — requires manager role [manager]
```

Bill calculation logic (always calculate server-side, never trust client totals):
```javascript
// subtotal = SUM of (order_items.unit_price × order_items.quantity) for all items
// discount_amount = passed in request body (0 by default)
// tax_amount = 0 by default (add tax logic here when required)
// total_amount = subtotal - discount_amount + tax_amount
```

**`backend/routes/payments.js`**:
```
POST   /api/v1/payments            → Record a payment [cashier]
POST   /api/v1/payments/split      → Record split payment (multiple payment records for one bill) [cashier]
GET    /api/v1/payments/bill/:billId → Get all payments for a bill [cashier, manager]
```

Payment rules:
- Cash: `amount` is required. Calculate change = `amount - bill.total_amount`. Return change in response.
- Telebirr/CBE Birr: `reference_no` is required. No API call. Just store the reference number the cashier types from the customer's phone screen.
- Split payment: create multiple payment records linked to the same bill_id. The sum of all payment amounts must equal the bill total. Validate this server-side.
- After payment is confirmed: update `bills.status = 'paid'`, update `orders.status = 'billed'`, create a `receipt` record.

**`backend/routes/receipts.js`**:
```
GET    /api/v1/receipts/:id        → Get receipt data formatted for display/print [cashier, authenticated]
```

Receipt response format:
```json
{
  "receipt_number": "RCP-20260518-0042",
  "date": "May 18, 2026",
  "time": "14:32",
  "business_name": "Ethiopian Hospitality Enterprises",
  "cashier_name": "Tigist",
  "items": [
    { "name": "Tibs", "quantity": 2, "unit_price": 180.00, "line_total": 360.00 }
  ],
  "subtotal": 360.00,
  "discount_amount": 0.00,
  "tax_amount": 0.00,
  "total_amount": 360.00,
  "payment_method": "Telebirr",
  "reference_no": "TLB-123456",
  "change_given": 0.00
}
```

**`frontend/src/pages/POSPage.jsx`** — POS screen layout:

The POS screen has 3 columns using Tailwind flexbox:
```
┌─────────────────────────────────────────────────────────────────┐
│  Left (w-1/3): Menu Panel        Center (w-1/3): Order Panel   │
│  ─────────────────             ──────────────────              │
│  [Search input        ]         Table: [Dropdown      ▼]       │
│  [Category tabs: All|Food|Drink] ─────────────────────          │
│  ┌────────────────────┐          Item 1  x2  ETB 360.00  [−][+]│
│  │ Item Name  ETB 180 │          Item 2  x1  ETB 120.00  [−][+]│
│  │ [Add to Order]     │                                         │
│  └────────────────────┘         [+ Add more items]              │
│  ┌────────────────────┐         [Send to Kitchen]               │
│  │ Item Name  ETB 240 │                                         │
│  └────────────────────┘         Right (w-1/3): Billing Panel   │
│                                 ──────────────────              │
│                                 Subtotal:    ETB 480.00         │
│                                 Discount:    ETB   0.00         │
│                                 Total:       ETB 480.00         │
│                                                                  │
│                                 [○ Cash] [○ Telebirr] [○ CBE]  │
│                                 Reference No: [_____________]   │
│                                 (shown only for Telebirr/CBE)   │
│                                                                  │
│                                 [Generate Bill]                 │
│                                 [Split Bill]  [Void Bill]       │
└─────────────────────────────────────────────────────────────────┘
```

Rules for the POS screen:
- The search input filters menu items by `name_en` in real time (client-side filter on fetched list)
- Category tabs filter by `category_id`
- "Send to Kitchen" button creates the order via `POST /api/v1/orders`
- "Generate Bill" button creates the bill via `POST /api/v1/bills`
- Reference number field is hidden when Cash is selected, visible for Telebirr/CBE
- Discount field: clicking it prompts for manager PIN before allowing entry
- Void Bill: only shown if user role is manager or superadmin
- Split Bill: opens a modal where items or amounts are assigned to multiple payers

### STEP 10: Socket.io — Real-Time Events

**`backend/sockets/index.js`** — Initialize and manage rooms:
```javascript
const jwt = require('jsonwebtoken');
const orderEvents = require('./orderEvents');
const tableEvents = require('./tableEvents');

module.exports = function initSockets(io) {
  // Authenticate socket connection using JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Socket authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      // KDS and Bar displays use a pre-shared token — allow them without user JWT
      if (socket.handshake.auth?.displayToken === process.env.DISPLAY_TOKEN) {
        socket.user = { role: 'display' };
        next();
      } else {
        next(new Error('Invalid socket token'));
      }
    }
  });

  io.on('connection', (socket) => {
    const role = socket.user?.role;

    // Join the correct room based on role
    if (role === 'kitchen' || role === 'display') socket.join('kitchen');
    if (role === 'bar') socket.join('bar');
    if (role === 'waiter') socket.join(`waiter:${socket.user.userId}`);
    if (['superadmin','manager','cashier'].includes(role)) {
      socket.join('management');
    }

    console.log(`Socket connected: ${socket.id} role=${role}`);

    orderEvents(io, socket);
    tableEvents(io, socket);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
```

**`backend/sockets/orderEvents.js`** — All order-related socket events:

The server emits these events (server → client):

```javascript
// 1. order:new — sent to kitchen or bar room when a new order is placed
// Emitted by: POST /api/v1/orders route after saving to DB
// Received by: KDS page (kitchen room), Bar display page (bar room)
{
  event: 'order:new',
  data: {
    orderId: 42,
    type: 'restaurant',        // or 'bar'
    tableId: 5,
    tableLabel: 'Table 5',
    waiterName: 'Abebe',
    items: [
      { itemId: 1, name: 'Tibs', quantity: 2, modifiers: ['Extra spicy'], notes: '' },
      { itemId: 2, name: 'Injera', quantity: 4, modifiers: [], notes: '' },
    ],
    timestamp: '2026-05-18T14:32:00.000Z',
  }
}

// 2. order:updated — sent to specific waiter when kitchen/bar marks order ready
// Emitted by: item:status handler below
// Received by: waiter's tablet (waiter:{userId} room)
{
  event: 'order:updated',
  data: {
    orderId: 42,
    tableLabel: 'Table 5',
    status: 'ready',
    message: 'Order for Table 5 is ready!',
  }
}

// 3. table:status — sent to ALL clients when a table's status changes
// Emitted by: PATCH /api/v1/tables/:id/status route
// Received by: waiter page, cashier page, manager
{
  event: 'table:status',
  data: {
    tableId: 5,
    label: 'Table 5',
    status: 'occupied',   // available | occupied | reserved
  }
}
```

The server listens for these events (client → server):

```javascript
// item:status — kitchen or bar marks an item or order as ready
// Sent by: KDS page, Bar display page
socket.on('item:status', async ({ orderId, itemId, status, waiterId }) => {
  // 1. Update order_items.status in DB (if itemId provided)
  // 2. Check if ALL items in the order are now 'ready'
  // 3. If yes: update orders.status = 'ready'
  // 4. Notify the waiter:
  io.to(`waiter:${waiterId}`).emit('order:updated', {
    orderId,
    tableLabel,
    status: 'ready',
    message: `Order for ${tableLabel} is ready!`,
  });
});
```

### STEP 11: Kitchen Display System (KDS)

**`frontend/src/pages/KDSPage.jsx`** — Kitchen Display:

The KDS is a fullscreen page that requires NO login UI. It shows orders in 3 columns.

Layout:
```
┌──────────────────────────────────────────────────────────────────┐
│  🍳 KITCHEN DISPLAY               SmartHMS    [clock: 14:32:05] │
├───────────────┬──────────────────┬───────────────────────────────┤
│   PENDING     │   PREPARING      │   READY                       │
├───────────────┼──────────────────┼───────────────────────────────┤
│ ┌───────────┐ │ ┌──────────────┐ │ ┌─────────────────────┐      │
│ │ TABLE 3   │ │ │ TABLE 7      │ │ │ TABLE 2             │      │
│ │ 00:02:14  │ │ │ 00:05:41     │ │ │ ✓ READY             │      │
│ │ Waiter:   │ │ │ Waiter: Hana │ │ │                     │      │
│ │  Abebe    │ │ │              │ │ │ • Tibs x2     ✓     │      │
│ │           │ │ │ • Shiro x1 ⏳│ │ │ • Injera x4   ✓     │      │
│ │ • Tibs x2 │ │ │ • Kitfo x2 ⏳│ │ │                     │      │
│ │ • Injera  │ │ │              │ │ └─────────────────────┘      │
│ │  x4       │ │ │ [Mark Ready] │ │                               │
│ │           │ │ └──────────────┘ │                               │
│ │[Preparing]│ │                  │                               │
│ └───────────┘ │                  │                               │
└───────────────┴──────────────────┴───────────────────────────────┘
```

KDS behavior rules:
- Connect to socket on page load using a display token (no user login required)
- Join `kitchen` room automatically
- On `order:new` event: add card to PENDING column + play audio chime
- Tap "Preparing" button on a card: emit `item:status` with status `preparing`, move card to PREPARING column
- Tap "Mark Ready" button: emit `item:status` with status `ready`, move card to READY column
- Each card shows an elapsed timer (`mm:ss`) counting up from when the order was placed
- Cards in READY column stay for 5 minutes then fade out (after waiter confirms delivery)
- Audio chime: use a short `<audio>` element with a `.mp3` file. Play on each `order:new` event.
- The clock in the top-right updates every second using `setInterval`

---

## ─────────────────────────────────────────
## PHASE 3 — Extended Modules (Weeks 13–18)
## ─────────────────────────────────────────

### STEP 12: Bar Module

The bar module is nearly identical to the restaurant module. The key differences are:

1. Orders have `type = 'bar'` instead of `'restaurant'`
2. Socket events go to the `'bar'` room instead of `'kitchen'`
3. Happy-hour pricing: if current server time is between `menu_items.happy_hour_start` and `menu_items.happy_hour_end`, use `menu_items.happy_hour_price` instead of `menu_items.price`
4. Bar orders can be linked to a table (for restaurant customers ordering drinks) OR have no table (bar counter walk-in)

**Happy-hour price selection logic (backend, in order creation):**
```javascript
function getItemPrice(menuItem) {
  if (menuItem.happy_hour_price && menuItem.happy_hour_start && menuItem.happy_hour_end) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = menuItem.happy_hour_start.split(':').map(Number);
    const [endH, endM] = menuItem.happy_hour_end.split(':').map(Number);
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;
    if (currentTime >= start && currentTime <= end) {
      return menuItem.happy_hour_price;
    }
  }
  return menuItem.price;
}
```

**`frontend/src/pages/BarDisplayPage.jsx`:**
- Same layout as KDS but subscribes to the `bar` socket room
- Shows a happy-hour countdown banner at the top when happy hour is active:
  `"🍺 Happy Hour ends in 00:42:15"` — amber background, countdown timer
- Beverage inventory widget: collapsible sidebar showing current stock per drink item

### STEP 13: Butcher Module

**What makes butcher different from other modules:**
- Items are sold by weight in kg, not by count
- Price = `menu_items.price` (which is the price per kg) × `weight_kg` entered by the user
- The `order_items.weight_kg` column stores the weight
- The `order_items.quantity` is always 1 for butcher items
- No table selection needed — sales happen at the butcher counter
- A bill is generated immediately after each sale (no "send to kitchen" step)

**`frontend/src/pages/ButcherPage.jsx`** layout:
```
┌────────────────────────────────────────────────────────────────┐
│  🥩 BUTCHER POS                                                │
│                                                                 │
│  [Search meat items...                               ]         │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Beef Ribs│  │ Lamb Leg │  │ Tibs Cut │  │ Liver    │     │
│  │ETB 280/kg│  │ETB 320/kg│  │ETB 250/kg│  │ETB 200/kg│     │
│  │ [Select] │  │ [Select] │  │ [Select] │  │ [Select] │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                                                 │
│  ── Current Order ─────────────────────────────────────────   │
│  Beef Ribs    [  1.75  ] kg  × ETB 280  =  ETB 490.00  [✕]  │
│  Lamb Leg     [  0.50  ] kg  × ETB 320  =  ETB 160.00  [✕]  │
│                                                                 │
│  TOTAL:  ETB 650.00                                            │
│                                                                 │
│  [○ Cash]  [○ Telebirr]  [○ CBE Birr]                        │
│  [Confirm Sale & Generate Receipt]                             │
│                                                                 │
│  ── Today's Summary ──────────────────────────────────────    │
│  Total sales: ETB 12,450.00  |  Total weight: 47.3 kg         │
└────────────────────────────────────────────────────────────────┘
```

Behavior:
- Selecting an item opens a weight input modal (numeric input, decimal allowed, e.g. `1.75`)
- As user types weight, live price preview updates: `1.75 kg × ETB 280 = ETB 490.00`
- "Confirm Sale" creates order → order_item (with weight_kg) → bill → payment in one flow
- Today's summary fetches from `GET /api/v1/reports/butcher/daily?date=today`

### STEP 14: Grocery Module

**`frontend/src/pages/GroceryPage.jsx`** layout:
```
┌────────────────────────────────────────────────────────────────┐
│  🛒 GROCERY POS                                                │
│  [Search by name or code...                          ]         │
│                                                                 │
│  Quick Add (top 8 bestsellers):                                │
│  [Bread][Sugar 1kg][Oil 1L][Salt][Rice 1kg][Pasta][Tea][Water] │
│                                                                 │
│  Search Results:                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Sugar 2kg Pack    ETB 85.00   Stock: 42 packs  [+ Add]  │  │
│  │ Sugar 5kg Pack    ETB 195.00  Stock: 18 packs  [+ Add]  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ── Cart ─────────────────────────────────  Total: ETB 280.00 │
│  Sugar 2kg  x1  ETB 85.00  [−][+][✕]                         │
│  Oil 1L     x2  ETB 97.50  [−][+][✕]                         │
│  [○ Cash] [○ Telebirr] [○ CBE]  [Confirm & Receipt]          │
└────────────────────────────────────────────────────────────────┘
```

**Supplier Management page** (separate page, grocery/admin only):
- Table listing all suppliers with their details
- "Add Supplier" button → modal form
- "Receive Stock" button per supplier → form: select inventory items + quantities → creates `stock_movements`
- Reorder alerts list: items where `current_stock <= min_threshold`

**Backend endpoints needed:**
```
GET    /api/v1/inventory                → list all items with stock levels [grocery, admin, manager]
POST   /api/v1/inventory                → create inventory item [admin, manager]
PATCH  /api/v1/inventory/:id            → update item (name, threshold, cost) [admin, manager]
POST   /api/v1/inventory/receive        → receive stock from supplier [grocery, manager]
GET    /api/v1/inventory/alerts         → items at or below min_threshold [grocery, manager, admin]
GET    /api/v1/suppliers                → list suppliers [grocery, manager, admin]
POST   /api/v1/suppliers                → add supplier [admin, manager]
PATCH  /api/v1/suppliers/:id            → update supplier [admin, manager]
```

After every sale (in any module), deduct stock:
```javascript
// Called after payment is confirmed, for each order_item:
async function deductStock(orderItem) {
  const inventoryItem = await InventoryItem.findOne({
    where: { name_en: menuItem.name_en, module: order.type }
  });
  if (!inventoryItem) return; // No stock tracking for this item
  inventoryItem.current_stock -= orderItem.quantity;
  await inventoryItem.save();
  await StockMovement.create({
    inventory_item_id: inventoryItem.id,
    delta: -orderItem.quantity,
    reason: 'Sale',
    reference_id: orderItem.order_id,
    user_id: req.user.userId,
  });
}
```

### STEP 15: Hotel Rooms Module

**`backend/routes/rooms.js`**:
```
GET    /api/v1/rooms                    → all rooms with status [receptionist, cashier, manager, admin]
POST   /api/v1/rooms                    → create room [admin]
PATCH  /api/v1/rooms/:id               → update room details [admin, manager]

GET    /api/v1/bookings                 → list bookings (filter by status, date) [receptionist, cashier, manager, admin]
POST   /api/v1/bookings                 → create booking [receptionist, cashier]
PATCH  /api/v1/bookings/:id/checkin    → check in guest → set room.status = 'occupied' [receptionist, cashier]
PATCH  /api/v1/bookings/:id/checkout   → check out → calculate total → create bill [receptionist, cashier]
GET    /api/v1/bookings/:id/charges    → list guest charges [receptionist, cashier]
POST   /api/v1/bookings/:id/charges    → add charge to guest tab [receptionist, cashier]
```

**Checkout calculation (server-side):**
```javascript
// On PATCH /api/v1/bookings/:id/checkout:
const checkIn = new Date(booking.check_in);
const checkOut = new Date(booking.check_out);
const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
const roomTotal = booking.rate_per_night * nights;
const chargesTotal = guestCharges.reduce((sum, c) => sum + Number(c.amount), 0);
const totalAmount = roomTotal + chargesTotal;

// Update booking
booking.total_amount = totalAmount;
booking.status = 'checked_out';
await booking.save();

// Set room back to available
await Room.update({ status: 'available' }, { where: { id: booking.room_id } });

// Create a bill for this checkout (same bill structure as POS)
// Then frontend proceeds to payment just like a regular POS payment
```

**`frontend/src/pages/RoomsPage.jsx`** layout:
```
┌────────────────────────────────────────────────────────────────┐
│  🏨 HOTEL ROOMS                                                │
│  Occupancy today: 14/20 rooms (70%)  Revenue today: ETB 42,000│
│                                                                 │
│  [Filter: All | Available | Occupied | Maintenance]            │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  101     │  │  102     │  │  103     │  │  104     │     │
│  │ Standard │  │ Deluxe   │  │ Standard │  │ Suite    │     │
│  │ 🟢 Free  │  │ 🔴 Occ.  │  │ 🔴 Occ. │  │ 🟢 Free  │     │
│  │ETB 800/n │  │ John M.  │  │ Sara A.  │  │ETB 2500/n│     │
│  │[Book Now]│  │ Day 3    │  │ Day 1    │  │[Book Now]│     │
│  │          │  │[View][Out]│  │[View][Out]│ │          │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└────────────────────────────────────────────────────────────────┘
```

Clicking a room:
- If available → open "New Booking" form (guest name, phone, check-in date, check-out date, rate confirmation)
- If occupied → open booking details panel showing: guest name, check-in date, nights stayed so far, all charges, "Add Charge" button, "Check Out" button

### STEP 16: Reporting & Analytics Module

**`backend/routes/reports.js`**:
```
GET    /api/v1/reports/revenue          → revenue grouped by module + date range [manager, admin]
GET    /api/v1/reports/bestsellers      → top 10 items by quantity and revenue [manager, admin]
GET    /api/v1/reports/staff            → orders and revenue per staff member [manager, admin]
GET    /api/v1/reports/inventory        → stock movement history [manager, admin, grocery]
GET    /api/v1/reports/daily-summary    → today's full summary [manager, admin, cashier]
GET    /api/v1/reports/butcher/daily    → butcher kg + revenue by date [manager, admin, butcher]
POST   /api/v1/reports/close-day        → lock the day [manager, admin]
```

All report endpoints accept query params: `?startDate=2026-05-01&endDate=2026-05-31`

**Close Day flow:**
1. Manager clicks "Close Day" button
2. System checks: are there any open (unpaid) bills? If yes → show warning list → cannot close until settled
3. Manager enters physical cash count amount in a form
4. System calculates: `cash_variance = physical_cash_count - sum of cash payments today`
5. If variance > 0: "Cash over by ETB X". If < 0: "Cash short by ETB X"
6. Manager confirms → `POST /api/v1/reports/close-day` → creates `daily_summaries` record → locks all today's orders from editing

**`frontend/src/pages/ReportsPage.jsx`** layout:
```
┌────────────────────────────────────────────────────────────────┐
│  📊 REPORTS & ANALYTICS                                        │
│  [Today] [This Week] [This Month] [Custom: from__ to__]       │
│                                                                 │
│  ┌─── Revenue by Module ─────────────────────────────────┐   │
│  │  Bar chart (Recharts): Restaurant|Bar|Butcher|Grocery|Rooms│
│  └───────────────────────────────────────────────────────┘   │
│                                                                 │
│  Total Revenue: ETB 125,400   Total Orders: 342               │
│  Cash: ETB 48,000  Telebirr: ETB 55,000  CBE: ETB 22,400     │
│                                                                 │
│  ┌─── Top 10 Items ───┐   ┌─── Staff Performance ─────┐     │
│  │ 1. Tibs      342   │   │ Abebe (Waiter) — 87 orders │     │
│  │ 2. Injera    289   │   │ Tigist (Cashier)— ETB 45k  │     │
│  └────────────────────┘   └───────────────────────────┘     │
│                                                                 │
│  ┌─── Inventory Alerts (3 items low) ─────────────────────┐  │
│  │ ⚠ Teff flour — 2 kg remaining (min: 10 kg)             │  │
│  └───────────────────────────────────────────────────────┘   │
│                                                                 │
│          [🔒 Close Day]                                        │
└────────────────────────────────────────────────────────────────┘
```

---

## ─────────────────────────────────────────
## PHASE 4 — Frontend Completion & Polish (Weeks 19–21)
## ─────────────────────────────────────────

### STEP 17: App Routing and Role Guards

**`frontend/src/App.jsx`**:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';

// Pages
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import POSPage from './pages/POSPage';
import WaiterPage from './pages/WaiterPage';
import KDSPage from './pages/KDSPage';
import BarDisplayPage from './pages/BarDisplayPage';
import ButcherPage from './pages/ButcherPage';
import GroceryPage from './pages/GroceryPage';
import RoomsPage from './pages/RoomsPage';
import ReportsPage from './pages/ReportsPage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { OfflineBanner } from './components/common/OfflineBanner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 1000,  // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const rehydrate = useAuthStore((s) => s.rehydrate);

  // On app load, restore session from localStorage refresh token
  useEffect(() => { rehydrate(); }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <OfflineBanner />
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* KDS and Bar Display — no login required, use display token */}
          <Route path="/kds" element={<KDSPage />} />
          <Route path="/bar-display" element={<BarDisplayPage />} />

          {/* Protected routes — must be logged in */}
          <Route path="/" element={
            <ProtectedRoute allowedRoles={['superadmin','manager','cashier','waiter','butcher','grocery','receptionist']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/pos" element={
            <ProtectedRoute allowedRoles={['superadmin','manager','cashier']}>
              <POSPage />
            </ProtectedRoute>
          } />
          <Route path="/waiter" element={
            <ProtectedRoute allowedRoles={['superadmin','manager','waiter']}>
              <WaiterPage />
            </ProtectedRoute>
          } />
          <Route path="/butcher" element={
            <ProtectedRoute allowedRoles={['superadmin','manager','butcher']}>
              <ButcherPage />
            </ProtectedRoute>
          } />
          <Route path="/grocery" element={
            <ProtectedRoute allowedRoles={['superadmin','manager','grocery']}>
              <GroceryPage />
            </ProtectedRoute>
          } />
          <Route path="/rooms" element={
            <ProtectedRoute allowedRoles={['superadmin','manager','receptionist','cashier']}>
              <RoomsPage />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={['superadmin','manager']}>
              <ReportsPage />
            </ProtectedRoute>
          } />

          {/* Redirect unknown paths to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

**`frontend/src/components/layout/ProtectedRoute.jsx`**:
```jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
```

**`frontend/src/components/common/OfflineBanner.jsx`**:
```jsx
import { useState, useEffect } from 'react';
import { t } from '../../utils/i18n';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 text-sm font-medium">
      ⚠️ {t('common.offline')}
    </div>
  );
}
```

### STEP 18: Receipt Print View

**`frontend/src/components/pos/ReceiptView.jsx`**:

This component renders the receipt and is also used for printing via `window.print()`.
The print CSS hides everything except this component.

```jsx
import { formatETB } from '../../utils/formatCurrency';
import { t } from '../../utils/i18n';

export function ReceiptView({ receipt }) {
  const handlePrint = () => window.print();

  return (
    <>
      {/* Print styles — only show receipt when printing */}
      <style>{`
        @media print {
          body > *:not(#receipt-root) { display: none !important; }
          #receipt-root { display: block !important; }
          @page { size: 80mm auto; margin: 0; }
        }
      `}</style>

      <div id="receipt-root" className="bg-white p-4 max-w-xs mx-auto font-mono text-sm">
        {/* Header */}
        <div className="text-center mb-3">
          <div className="font-bold text-base">Ethiopian Hospitality Enterprises</div>
          <div className="text-xs text-gray-500">Smart HMS</div>
          <div className="text-xs">{receipt.date} — {receipt.time}</div>
          <div className="text-xs">Receipt #: {receipt.receipt_number}</div>
          <div className="text-xs">Cashier: {receipt.cashier_name}</div>
        </div>

        <div className="border-t border-dashed border-gray-400 my-2" />

        {/* Items */}
        {receipt.items.map((item, i) => (
          <div key={i} className="flex justify-between text-xs mb-1">
            <span className="flex-1">
              {item.name}
              {item.weight_kg ? ` (${item.weight_kg}kg)` : ` x${item.quantity}`}
            </span>
            <span className="ml-2">{formatETB(item.line_total)}</span>
          </div>
        ))}

        <div className="border-t border-dashed border-gray-400 my-2" />

        {/* Totals */}
        <div className="flex justify-between text-xs"><span>Subtotal</span><span>{formatETB(receipt.subtotal)}</span></div>
        {receipt.discount_amount > 0 && (
          <div className="flex justify-between text-xs text-green-700"><span>Discount</span><span>-{formatETB(receipt.discount_amount)}</span></div>
        )}
        {receipt.tax_amount > 0 && (
          <div className="flex justify-between text-xs"><span>Tax</span><span>{formatETB(receipt.tax_amount)}</span></div>
        )}
        <div className="flex justify-between font-bold text-sm border-t mt-1 pt-1">
          <span>TOTAL</span><span>{formatETB(receipt.total_amount)}</span>
        </div>

        {/* Payment */}
        <div className="mt-2 text-xs">
          <div>Payment: {receipt.payment_method}</div>
          {receipt.reference_no && <div>Reference: {receipt.reference_no}</div>}
          {receipt.change_given > 0 && <div>Change: {formatETB(receipt.change_given)}</div>}
        </div>

        <div className="border-t border-dashed border-gray-400 my-2" />
        <div className="text-center text-xs text-gray-500">Thank you for your visit!</div>
      </div>

      {/* Print button — hidden when actually printing */}
      <div className="text-center mt-4 print:hidden">
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {t('bill.print')}
        </button>
      </div>
    </>
  );
}
```

---

## ─────────────────────────────────────────
## PHASE 5 — Testing (Weeks 22–23)
## ─────────────────────────────────────────

### STEP 19: Testing Checklist

Use **Jest + Supertest** for backend. Run `npm test` in `/backend`.

**Unit tests to write:**
- `POST /api/v1/auth/login` — correct PIN → returns tokens; wrong PIN → 401; inactive user → 401
- `POST /api/v1/auth/refresh` — valid refresh token → new access token; expired → 401
- RBAC middleware — waiter tries to access `/api/v1/reports` → 403
- Bill calculation — `subtotal`, `discount`, `total` math is correct
- Butcher price — `1.75 kg × ETB 280 = ETB 490.00`
- Happy-hour price — current time within range → returns happy_hour_price

**Integration tests to write:**
1. Waiter login → create order on Table 3 → verify Socket.io `order:new` emitted to kitchen room
2. Kitchen marks order ready → verify `order:updated` emitted to waiter room
3. Cashier generates bill → processes Telebirr payment → receipt created → bill status = paid
4. Table status updates after order created → all clients receive `table:status` event
5. Manager closes day → `daily_summaries` record created → open orders blocked from editing

**Manual UAT scripts for client staff:**

Waiter test:
1. Login with waiter PIN
2. Go to Waiter screen → see table list
3. Select "Table 4" from dropdown
4. Search "Tibs" → add 2 portions
5. Search "Tej" → add 1 bottle
6. Tap "Send Order" → confirm success message
7. Wait for "Order Ready" notification on screen
8. Confirm order delivered

Cashier test:
1. Login with cashier PIN
2. Go to POS → find Table 4's open order
3. Tap "Generate Bill" → see ETB total
4. Select "Telebirr" → type reference number "TLB-123456"
5. Tap "Confirm Payment" → receipt appears
6. Tap "Print Receipt" → browser print dialog opens

Kitchen test:
1. Open `/kds` in browser (no login needed)
2. Waiter places order → new card appears in PENDING column
3. Hear audio chime
4. Tap "Preparing" → card moves to PREPARING
5. Tap "Mark Ready" → card moves to READY → waiter notified

Manager close-day test:
1. Login as manager
2. Go to Reports → confirm all tables settled
3. Tap "Close Day"
4. Enter physical cash count: ETB 12,400
5. See variance: "Cash over by ETB 200"
6. Confirm → day locked

---

## ─────────────────────────────────────────
## PHASE 6 — Deployment on Yegara cPanel (Week 24)
## ─────────────────────────────────────────

### STEP 20: Prepare for Deployment

This system deploys entirely through the Yegara cPanel web interface.
No SSH access, no Linux commands, no PM2, no Nginx configuration needed.
cPanel handles all process management and routing automatically.

**What you will deploy:**
- React frontend → built as static files → uploaded to a folder in cPanel
- Node.js backend → uploaded as a zip → set up via cPanel "Setup Node.js App"
- MySQL database → created via cPanel "MySQL Databases" tool

**Before uploading, do this locally:**

```bash
# 1. Build React frontend for production
cd frontend
npm run build
# This creates a /frontend/build/ folder with static HTML/CSS/JS files

# 2. Prepare backend for upload
cd ../backend
# Delete node_modules (cPanel will install them)
rm -rf node_modules
# Create a zip of the backend folder (exclude .env — set it on server)
zip -r backend.zip . --exclude ".env" --exclude "node_modules/*" --exclude ".git/*"
```

### STEP 21: Database Setup in cPanel

1. Log into your Yegara cPanel account
2. In cPanel, search for **"MySQL Databases"** and open it
3. Under "Create New Database": type `smarthms_db` → click **Create Database**
4. Under "MySQL Users" → "Add New User": type username `smarthms_user`, set a strong password → click **Create User**
5. Under "Add User to Database": select the user and the database → click **Add** → check **All Privileges** → click **Make Changes**
6. Write down: database name, username, password, host (`localhost`)

### STEP 22: Frontend Deployment in cPanel

**Option A — Deploy to main domain (yourdomain.com):**
1. In cPanel, open **File Manager**
2. Navigate to `public_html/`
3. Delete any existing files (or move them to a backup folder)
4. Click **Upload** → upload all files from your local `/frontend/build/` folder
5. Make sure `index.html` is directly inside `public_html/`
6. Test: open `https://yourdomain.com` — you should see the SmartHMS login page

**Option B — Deploy to a subdomain (app.yourdomain.com):**
1. In cPanel, search **"Domains"** or **"Subdomains"** → create `app.yourdomain.com`
2. Set the document root to `/public_html/app/`
3. Upload the `/frontend/build/` contents to `/public_html/app/`

**Fix React Router on cPanel (required):**
React Router uses client-side routing. Without this fix, refreshing any page other than `/` will give a 404 error.
Create a file named `.htaccess` inside the folder where you uploaded the build files:
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

### STEP 23: Backend Deployment in cPanel

1. In cPanel, open **File Manager**
2. Navigate to your home directory (e.g., `/home/yourusername/`)
3. Create a new folder named `smarthms-backend`
4. Click **Upload** → upload your `backend.zip` file into this folder
5. Right-click `backend.zip` → click **Extract** → extract into `smarthms-backend/`

6. In cPanel, search for **"Setup Node.js App"** (under SOFTWARE section) → click it
7. Click **"Create Application"**
8. Fill in:
   - **Node.js version:** Select 18 (or highest available)
   - **Application mode:** Production
   - **Application root:** `smarthms-backend` (the folder you created)
   - **Application URL:** Select your domain or subdomain for the API
     (e.g., `api.yourdomain.com` if you created that subdomain)
   - **Application startup file:** `server.js`
9. Click **Create**

10. After creation, scroll down to **"Environment variables"** section:
    Add each variable from your `.env` file here:
    - `PORT` = `5000`
    - `NODE_ENV` = `production`
    - `DB_HOST` = `localhost`
    - `DB_USER` = (your cPanel MySQL username)
    - `DB_PASS` = (your cPanel MySQL password)
    - `DB_NAME` = (your cPanel MySQL database name)
    - `JWT_SECRET` = (your secret string)
    - `JWT_REFRESH_SECRET` = (your refresh secret string)
    - `JWT_EXPIRES_IN` = `15m`
    - `JWT_REFRESH_EXPIRES_IN` = `30d`
    - `FRONTEND_URL` = `https://yourdomain.com`
    - `DISPLAY_TOKEN` = (any random string — used for KDS/Bar display socket auth)

11. Scroll down to **"Run NPM Install"** button → click it → wait for completion
12. Click **Restart** (or **Start**) to start the Node.js application

13. Test: open `https://api.yourdomain.com/api/v1/health` in browser
    → should return: `{"status":"ok","timestamp":"..."}`
    If you see this, the backend is running correctly.

### STEP 24: Run Database Migrations

After the backend is running, you need to create all the database tables.

In cPanel "Setup Node.js App", find your app and look for a **terminal** or **command** option. If available, run:
```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

**If cPanel does not have a terminal option**, do this instead:
- Add a temporary route to `server.js` for the initial setup:
```javascript
// TEMPORARY — remove after migrations run
app.get('/api/v1/setup-db', async (req, res) => {
  const { execSync } = require('child_process');
  try {
    const result = execSync('npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all', {
      cwd: __dirname, encoding: 'utf8'
    });
    res.json({ success: true, output: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```
- Deploy, then open `https://api.yourdomain.com/api/v1/setup-db` once in your browser
- **Remove this route immediately after migrations run** and redeploy

### STEP 25: SSL Setup

1. In cPanel, search **"Let's Encrypt SSL"** or **"SSL/TLS"**
2. Issue a free SSL certificate for:
   - `yourdomain.com` and `www.yourdomain.com` (frontend)
   - `api.yourdomain.com` (backend)
3. Enable "Force HTTPS Redirect" if available
4. Test: open both URLs with `https://` — green padlock should appear

SSL is required because:
- PWA service workers only work on HTTPS
- Socket.io needs a secure connection for WebSocket upgrade
- Telebirr/CBE reference entries should always travel over HTTPS

### STEP 26: Update Frontend API URL

Before building the React frontend for production, update the API URL:

Create `frontend/.env.production`:
```env
REACT_APP_API_URL=https://api.yourdomain.com
```

Then rebuild:
```bash
cd frontend
npm run build
```

Re-upload the new `/build/` contents to cPanel.

---

## ─────────────────────────────────────────
## GO-LIVE CHECKLIST — Verify Before Sign-Off
## ─────────────────────────────────────────

Verify every item below before the client signs the Go-Live Acceptance Form:

**Infrastructure:**
- [ ] `GET https://api.yourdomain.com/api/v1/health` returns `{"status":"ok"}`
- [ ] Frontend loads at `https://yourdomain.com` — login page appears
- [ ] HTTPS active on both frontend and backend URLs — green padlock visible
- [ ] Refreshing any page (e.g., `/pos`, `/rooms`) does NOT give a 404 (`.htaccess` working)

**Authentication:**
- [ ] Superadmin can log in with password
- [ ] Waiter can log in with PIN
- [ ] Wrong PIN gives "Invalid credentials" error — not a server crash
- [ ] After 15 minutes of inactivity, the system silently refreshes the token (no logout)
- [ ] Logging out clears the session — cannot go back with browser Back button

**Restaurant & Tables:**
- [ ] Tables list loads showing all tables with correct status colors
- [ ] Waiter selects Table 4 from dropdown → places order → success message shown
- [ ] Table 4 status changes to "Occupied" on all open browser tabs simultaneously

**Kitchen Display:**
- [ ] KDS page at `/kds` loads without login
- [ ] When waiter places order, KDS card appears within 2 seconds
- [ ] Audio chime plays on new order
- [ ] Elapsed timer counts up on each card
- [ ] "Mark Ready" button → waiter's screen shows notification

**POS & Billing:**
- [ ] Cash payment completes → receipt displays with correct total
- [ ] Telebirr payment → reference number field appears → stored correctly in DB
- [ ] CBE Birr payment → same as Telebirr
- [ ] Split bill: 2 payers, different methods, both payments recorded, receipt generated
- [ ] Void bill: only manager role can see and use this button

**Bar:**
- [ ] Bar display at `/bar-display` loads without login
- [ ] Drink order from waiter appears on bar display
- [ ] Happy-hour pricing activates at correct time (if configured)

**Butcher:**
- [ ] Search finds meat items
- [ ] Weight input calculates price live: `1.75 kg × ETB 280 = ETB 490.00`
- [ ] Sale confirmed → receipt generated → today's summary updates

**Grocery:**
- [ ] Item search works
- [ ] Stock level visible on each item
- [ ] After sale, stock level decreases
- [ ] Reorder alert appears for items below threshold

**Hotel Rooms:**
- [ ] Room grid shows correct status for each room
- [ ] New booking created → room shows as Reserved/Occupied
- [ ] Check-in works → room shows Occupied with guest name
- [ ] Add charge → appears in guest tab
- [ ] Check-out → total calculated correctly (nights × rate + charges) → bill generated

**Reports:**
- [ ] Revenue chart loads for Today, This Week, This Month
- [ ] Bestsellers table shows correct items
- [ ] Close Day: enter cash count → variance shown → confirm → day locked

**Print:**
- [ ] Receipt print dialog opens on all browsers (Chrome, Edge)
- [ ] Receipt fits on screen correctly (no overflow)

---

## APPENDIX A: Seeder Data (Initial Data for Launch)

Create `backend/seeders/001-initial-data.js` with this seed data:

**Default superadmin user:**
```javascript
// PIN: 1234 (change immediately after first login)
// password: admin123 (change immediately after first login)
{
  name: 'Admin',
  email: 'admin@smarthms.com',
  pin_hash: await bcrypt.hash('1234', 10),
  password_hash: await bcrypt.hash('admin123', 10),
  role: 'superadmin',
  is_active: true,
}
```

**Default categories:**
- Restaurant: Main Dishes, Injera & Breads, Salads, Soft Drinks, Juices
- Bar: Beers, Spirits, Wines, Cocktails, Non-Alcoholic
- Butcher: Beef, Lamb, Chicken, Offal
- Grocery: Grains & Flour, Oils & Fats, Spices, Packaged Foods, Beverages

**Default room types:**
- Standard Room — ETB 800/night — max 2 guests
- Deluxe Room — ETB 1,500/night — max 2 guests
- Suite — ETB 2,500/night — max 4 guests

**Default tables (adjust numbers to match the actual restaurant):**
- Table 1 through Table 20 (Main Hall, capacity 4)
- VIP 1 through VIP 3 (VIP Section, capacity 6)
- Outdoor 1 through Outdoor 5 (Outdoor, capacity 4)

---

## APPENDIX B: Permissions Quick Reference

| Route | Allowed Roles |
|---|---|
| `POST /api/v1/auth/login` | Public |
| `POST /api/v1/auth/refresh` | Public |
| `GET /api/v1/tables` | All authenticated |
| `POST /api/v1/orders` | waiter, cashier, butcher, grocery, receptionist, manager, superadmin |
| `PATCH /api/v1/orders/:id/status` | kitchen, bar, waiter, manager, superadmin |
| `POST /api/v1/bills` | cashier, manager, superadmin |
| `PATCH /api/v1/bills/:id/void` | manager, superadmin |
| `POST /api/v1/payments` | cashier, manager, superadmin |
| `GET /api/v1/rooms` | receptionist, cashier, manager, superadmin |
| `POST /api/v1/bookings` | receptionist, cashier, manager, superadmin |
| `GET /api/v1/inventory` | grocery, manager, superadmin |
| `POST /api/v1/inventory/receive` | grocery, manager, superadmin |
| `GET /api/v1/reports/*` | manager, superadmin |
| `POST /api/v1/reports/close-day` | manager, superadmin |
| `GET /api/v1/users` | superadmin |
| `POST /api/v1/users` | superadmin |

---

## APPENDIX C: Support SLA

| Priority | Example | Response | Resolution |
|---|---|---|---|
| P1 Critical | System completely down, no one can login | 2 hours | 4 hours or workaround provided |
| P2 High | One module not working (e.g. rooms broken) | 4 hours | Next business day |
| P3 Normal | Minor bug, wrong calculation on one screen | 24 hours | 3 business days |
| P4 Low | Enhancement request, cosmetic change | 72 hours | Next quarterly release |

Support: WhatsApp group (fastest) · Email: support@ilinkhms.et

---

*SmartHMS Codex Prompt v3.0 — Simplified for Phase 1 Launch*
*English only · Online-first · Simple table list · Yegara cPanel deployment (no VPS)*
*24 Weeks · 6 Phases · 7 Modules · React v18 + Tailwind · Node v18 · MySQL 8*