# SmartHMS — Full Implementation Prompt for AI Agent (Codex) v2.0

> **Stack:** React.js v18 + Tailwind CSS (PWA) · Node.js v20 LTS · MySQL 8.x · Socket.io · Deployed on Yegara Host VPS (Ubuntu 22.04 LTS)
> **Paste each phase block into the AI agent one phase at a time. Always paste SYSTEM CONTEXT first.**

---

## SYSTEM CONTEXT (Paste this first — always keep it in context)

You are building **Smart HMS**, a Hospitality Management System for Ethiopian Hospitality Enterprises.

**Tech Stack:**
- Frontend: React.js v18 + Tailwind CSS, PWA (service worker + IndexedDB via Dexie.js), Zustand for global state, React Query for API data caching and sync, served via Nginx
- Backend: Node.js v20 LTS, Express.js, Sequelize v6 ORM with connection pooling, MySQL 8.x, Socket.io v4.x, JWT auth (bcryptjs)
- Deployment: Yegara Host VPS running Ubuntu 22.04 LTS, PM2 process manager, Nginx reverse proxy, SSL via Let's Encrypt (Certbot)
- All API routes are prefixed: `/api/v1/`

**Modules to build:**
1. POS & Billing (cash, Telebirr, CBE Birr, ETB receipts in Amharic/English)
2. Restaurant & Table Management (visual floor map, waiter tablet ordering, Kitchen Display System)
3. Bar Module (drink routing, bar display, happy-hour pricing)
4. Butcher Module (per-kg pricing, text search, no barcode)
5. Grocery Module (search-based POS, supplier management)
6. Hotel Rooms Module (booking, check-in/out, guest billing)
7. Inventory, Reporting & Analytics (real-time dashboards)

**Key rules:**
- No barcode scanners — all item lookup is by name/category text search only
- Offline-first: IndexedDB (Dexie.js) stores orders/menu/billing locally; a `sync_queue` table in both IndexedDB and MySQL tracks what needs syncing; auto-sync to MySQL within 30 seconds of reconnect via `POST /api/v1/sync`
- Payments: Cash (direct), Telebirr & CBE Birr (manual reference number entry — no payment API)
- All UI must support Amharic (Fidel) and English; per-user `language_pref` stored in DB
- JWT access tokens expire in **15 minutes**; refresh tokens expire in 30 days
- Soft deletes (`deleted_at`, `paranoid: true`) on: `users`, `menu_items`, `orders`, `bills`, `rooms`, `bookings`
- Sequelize connection pool: `{ max: 20, min: 5, acquire: 30000, idle: 10000 }`
- Performance targets: order→KDS display <2s, bill generation <1s, dashboard load <3s
- Scale targets: 50 concurrent users, 10,000 daily transactions

---

## PHASE 1 — Discovery & Design (Weeks 1–4)

### Step 1: Initialize Project Structure

Create the following folder structure:

```
/smarthms/
  /frontend/                    ← React.js v18 PWA + Tailwind CSS
    /src/
      /pages/                   ← POS, Waiter, KDS, Bar, Butcher, Grocery, Rooms, Admin, Reports
      /store/                   ← Zustand stores: authStore.js, orderStore.js, cartStore.js
      /hooks/                   ← React Query hooks: useOrders.js, useMenu.js, useRooms.js, etc.
      /db/                      ← Dexie.js IndexedDB schema, offline helpers, syncManager.js
      /components/              ← Shared UI components (Button, Modal, SearchBar, ReceiptView)
      /utils/                   ← formatETB.js, i18n.js (Amharic/English), dateHelpers.js
  /backend/
    /routes/                    ← auth.js, orders.js, bills.js, payments.js, rooms.js, inventory.js, reports.js, sync.js
    /models/                    ← Sequelize models (one per table)
    /middleware/                 ← auth.js (JWT verify), rbac.js (role check), audit.js (logger)
    /sockets/                   ← orderEvents.js, kdsEvents.js, barEvents.js, tableEvents.js
    /migrations/                ← One Sequelize migration file per table
    /seeders/                   ← roles, superadmin user, room types, categories
    /config/                    ← database.js (with pool config), socket.js
    server.js
    .env
```

Bootstrap commands:

```bash
# Frontend — PWA template + Tailwind CSS
npx create-react-app frontend --template cra-template-pwa
cd frontend
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install zustand @tanstack/react-query dexie axios

# Backend
mkdir backend && cd backend
npm init -y
npm install express sequelize mysql2 socket.io jsonwebtoken bcryptjs dotenv cors helmet morgan
npm install --save-dev nodemon sequelize-cli
```

Configure Tailwind in `frontend/tailwind.config.js`:
```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

Add to `frontend/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 2: MySQL 8.x Database Schema

Create one Sequelize migration file per table. All tables include `created_at`, `updated_at`. Tables marked with ⚡ use soft deletes (`deleted_at`, `paranoid: true`).

**Core tables:**
- `users` ⚡ — id, name, pin_hash, password_hash, role (ENUM: superadmin, manager, cashier, waiter, kitchen, bar, butcher, grocery, receptionist), language_pref (ENUM: en, am, default: en), is_active, created_at, updated_at, deleted_at
- `roles_permissions` — role, module, can_read, can_write, can_void
- `audit_log` — id, user_id, action, entity, entity_id, payload (JSON), ip_address, created_at

**Menu & Ordering:**
- `categories` — id, name_en, name_am, module_type (ENUM: restaurant/bar/butcher/grocery), sort_order
- `menu_items` ⚡ — id, category_id, name_en, name_am, price, happy_hour_price (nullable), happy_hour_start (TIME, nullable), happy_hour_end (TIME, nullable), unit (ENUM: piece/kg/g), is_available (default: true), module, deleted_at
- `modifiers` — id, menu_item_id, name_en, name_am, price_delta
- `tables` — id, label, section, capacity, status (ENUM: available/occupied/reserved), x_pos, y_pos (for floor map rendering)
- `orders` ⚡ — id, table_id (nullable for bar/butcher/grocery), user_id (waiter), status (ENUM: pending/preparing/ready/served/billed/cancelled), type (ENUM: restaurant/bar/butcher/grocery/room), notes, deleted_at
- `order_items` — id, order_id, menu_item_id, quantity, weight_kg (DECIMAL, nullable — butcher only), unit_price, modifier_ids (JSON array), status (ENUM: pending/preparing/ready), notes

**Billing & Payments:**
- `bills` ⚡ — id, order_id, table_id (nullable), subtotal, discount_amount (default: 0), tax_amount (default: 0), total_amount, status (ENUM: open/paid/voided), deleted_at
- `payments` — id, bill_id, method (ENUM: cash/telebirr/cbe_birr), amount, reference_no (nullable — for Telebirr/CBE), confirmed_by (user_id), created_at
- `receipts` — id, bill_id, receipt_number (unique), language (ENUM: en/am), printed_at

**Hotel Rooms:**
- `room_types` — id, name, description, base_rate, max_occupancy
- `rooms` ⚡ — id, room_number, room_type_id, floor, status (ENUM: available/occupied/maintenance), amenities (JSON), deleted_at
- `bookings` ⚡ — id, room_id, guest_name, guest_phone, check_in (DATE), check_out (DATE), rate_per_night, total_amount, status (ENUM: confirmed/checked_in/checked_out/cancelled), deleted_at
- `guest_charges` — id, booking_id, description, amount, charged_by (user_id), charged_at

**Inventory:**
- `inventory_items` — id, name_en, name_am, module, unit, current_stock (DECIMAL), min_threshold (reorder level), cost_price
- `stock_movements` — id, inventory_item_id, delta (DECIMAL — positive=in, negative=out), reason, reference_id (nullable), user_id, created_at
- `suppliers` — id, name, contact_phone, email, items_supplied (TEXT), module

**Reporting:**
- `daily_summaries` — id, date, module, total_revenue, total_orders, total_payments_cash, total_payments_telebirr, total_payments_cbe, closed_by (user_id), closed_at

**Offline Sync:**
- `sync_queue` — id, entity (e.g. 'orders', 'payments'), payload (JSON), device_id, created_at, synced_at (nullable — null = pending)

### Step 3: Environment Configuration

Create `/backend/.env`:
```
PORT=5000
DB_HOST=localhost
DB_USER=smarthms_user
DB_PASS=your_strong_password
DB_NAME=smarthms_db
DB_POOL_MAX=20
DB_POOL_MIN=5
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000
JWT_SECRET=your_jwt_secret_256bit
JWT_REFRESH_SECRET=your_refresh_secret_256bit
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
FRONTEND_URL=https://yourdomain.com
NODE_ENV=development
```

Create `/backend/config/database.js`:
```javascript
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 20,
      min: parseInt(process.env.DB_POOL_MIN) || 5,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

module.exports = sequelize;
```

### Step 4: UI Page Scaffolding

Build wireframe-level React pages with Tailwind CSS layout (structure and routing only — full styling comes in Phase 2+):
- `LoginPage` — PIN pad (4–6 digit numeric) + toggle to username/password form; language toggle (EN/AM) at top
- `AdminDashboard` — module selector grid with role-filtered cards
- `POSPage` — 3-column layout: menu search left, order center, billing right
- `WaiterPage` — floor map view + order entry drawer
- `KDSPage` — fullscreen 3-column Kanban (Pending / Preparing / Ready)
- `BarDisplayPage` — fullscreen drink order board
- `ButcherPage` — search + weight input + running tally
- `GroceryPOSPage` — search-based POS with stock levels
- `RoomsPage` — room grid dashboard + booking panel
- `ReportsPage` — charts + date range + close day button

Set up React Router v6 with role-based route guards. Set up React Query `QueryClientProvider` in `App.js`.

---

## PHASE 2 — Core Development (Weeks 5–12)

### Step 5: Authentication System (Weeks 5–6)

**Backend — `/backend/routes/auth.js`:**

```
POST  /api/v1/auth/login    → accepts { username, password } OR { username, pin }
                               Returns { accessToken (15min JWT), refreshToken (30d JWT), user }
                               Store hashed refresh token in users.refresh_token_hash

POST  /api/v1/auth/refresh  → validates refresh token → returns new accessToken
POST  /api/v1/auth/logout   → clears refresh_token_hash in DB
```

**JWT Payload:**
```json
{ "userId": 1, "role": "waiter", "name": "Abebe", "lang": "am", "iat": ..., "exp": ... }
```

**Middleware — `/backend/middleware/auth.js`:**
- Verify Bearer token on all protected routes
- Return 401 if expired (frontend must catch and call `/api/v1/auth/refresh`)
- Attach `req.user` from decoded JWT

**Middleware — `/backend/middleware/rbac.js`:**
- `checkRole(...allowedRoles)` middleware factory
- Returns 403 if `req.user.role` not in allowed list

**Middleware — `/backend/middleware/audit.js`:**
- Log every POST/PATCH/PUT/DELETE to `audit_log` table: user_id, action, entity, entity_id, payload snapshot, ip_address

**Frontend — Zustand Auth Store (`/src/store/authStore.js`):**
- State: `user`, `accessToken`, `isAuthenticated`, `lang`
- Actions: `login()`, `logout()`, `refreshToken()`
- Store `refreshToken` in `localStorage` (only the refresh token — never store access token in localStorage; keep access token in memory)
- Auto-refresh access token **2 minutes before expiry** (set a `setTimeout` for 13 minutes after each token issue)
- On 401 response: call `refreshToken()` once, retry original request; if refresh fails → `logout()`

**React Query setup (`/src/hooks/useAuth.js`):**
- Wrap login/logout in React Query mutations
- Invalidate all queries on logout

**Login Page:**
- Language toggle button top-right (EN | አማ) — sets `lang` in store and applies to all UI
- Toggle between PIN pad (4–6 digit) and password input
- On success: redirect based on `user.role` to correct module page

### Step 6: POS & Billing Module (Weeks 7–8)

**Backend routes:**

```
POST   /api/v1/orders                  → Create new order [Waiter, Cashier]
GET    /api/v1/orders/:id              → Get order with items [Authenticated]
PATCH  /api/v1/orders/:id/status       → Update order status [Kitchen, Bar, Waiter]
POST   /api/v1/bills                   → Generate bill from order [Cashier]
POST   /api/v1/payments                → Process payment (cash/telebirr/cbe_birr) [Cashier]
POST   /api/v1/payments/split          → Split bill between multiple payers [Cashier]
PATCH  /api/v1/bills/:id/void          → Void bill (manager only) [Manager]
POST   /api/v1/bills/:id/refund        → Issue refund (manager only) [Manager]
GET    /api/v1/receipts/:id            → Get receipt data in en or am [Cashier]
```

**Payment logic:**
- Cash: record amount, calculate and display change
- Telebirr/CBE Birr: cashier manually enters `reference_no` from customer's phone screen. No payment API integration — manual reference entry only.
- Split bill: assign specific order items or fixed ETB amounts to multiple payers; each payer gets their own payment record

**Receipt generation:**
- Fields: receipt_number, date/time (Ethiopian format), business name, items list, subtotal, discount, tax, total (ETB), payment method, reference_no (if mobile payment), cashier name
- Language driven by `user.language_pref` — Amharic body with Amharic numerals, or English
- Print via `window.print()` with thermal-printer-optimized CSS (80mm width, no margins)

**Frontend — POS Screen (Tailwind layout):**
- Left panel (`w-1/3`): searchable menu — text search input, category filter tabs, item cards with name (EN+AM), price, stock badge
- Center panel (`w-1/3`): current order items, quantity controls, modifier selection, item notes
- Right panel (`w-1/3`): bill summary (subtotal / discount / tax / total in ETB), payment method radio buttons, reference number input field (visible only for Telebirr/CBE), confirm payment CTA
- Buttons: discount (prompts manager PIN), split bill, void (prompts manager PIN)

**React Query hooks:**
- `useMenuItems(module)` — cached menu with stale-while-revalidate
- `useCreateOrder()` — mutation that also updates order list cache
- `useCreateBill()` — mutation
- `useProcessPayment()` — mutation

### Step 7: Restaurant & Table Management (Weeks 9–10)

**Backend routes:**
```
GET    /api/v1/tables              → All tables with current status [Authenticated]
PATCH  /api/v1/tables/:id/status   → Update table status → emits table:status socket event [Waiter]
POST   /api/v1/orders              → New waiter order linked to table [Waiter]
PATCH  /api/v1/orders/:id/items    → Add/edit items on open order [Waiter]
```

When table status changes, emit to all connected clients:
```javascript
io.emit('table:status', { tableId, status, label })
```

**Frontend — Waiter Tablet View (Tailwind):**

1. **Floor Map Screen:**
   - Render tables as absolutely positioned `div` elements using `x_pos` / `y_pos` from DB
   - Color: `bg-green-500` = available, `bg-red-500` = occupied, `bg-yellow-400` = reserved
   - Subscribe to `table:status` socket event — update color in real-time without page refresh
   - Tap table → slide-in order entry drawer

2. **Order Entry Drawer:**
   - Category tabs across top, text search below
   - Item list: shows `name_en` / `name_am` based on user `lang`, price, unit
   - Tap item → increment quantity; long-press → modifier modal
   - Running order summary at bottom with "Send Order" button
   - "Send Order" → `POST /api/v1/orders` → server saves + emits `order:new` to KDS room

3. **Offline behavior:**
   - If `navigator.onLine === false`: save order to Dexie.js `pending_orders` store
   - Show persistent "Offline — order queued" banner (amber Tailwind bar at top)
   - Sync manager handles upload on reconnect (see Step 16)

### Step 8: Kitchen Display System — KDS (Weeks 11–12)

**Socket.io Events — `/backend/sockets/orderEvents.js`:**

```javascript
// Server → KDS room: new order arrives
io.to('kitchen').emit('order:new', {
  orderId, tableId, tableName, waiterId, waiterName,
  items: [{ itemId, name_en, name_am, qty, modifiers, notes }],
  timestamp
})

// Server → KDS room: order or item status updated
io.to('kitchen').emit('order:updated', { orderId, itemId, status })

// Kitchen client → server: item status change
socket.on('item:status', ({ orderId, itemId, status }) => {
  // 1. Update order_items.status in DB
  // 2. If all items ready → update orders.status to 'ready'
  // 3. Notify waiter:
  io.to(`waiter:${waiterId}`).emit('order:updated', { orderId, tableName, status: 'ready' })
})

// Server → all clients: table occupancy changed
io.emit('table:status', { tableId, status, label })

// Server → device: offline sync accepted
socket.emit('sync:ack', { syncedIds: [...], timestamp })
```

**Socket room management:**
- On connect: client sends `{ role, userId }` → server joins socket to role room (`kitchen`, `bar`, `waiter:${userId}`)
- KDS browser joins `kitchen` room; Bar display joins `bar` room

**KDS Frontend Page (fullscreen, Tailwind):**
- 3-column Kanban: **Pending** | **Preparing** | **Ready** — each column scrollable
- Order card: table name (large), elapsed time (auto-updating `mm:ss`), items list, modifiers in grey text
- Card background changes: white → `bg-yellow-50` (Preparing) → `bg-green-50` (Ready)
- Tap item row → mark Preparing; tap "✓ Mark Ready" button → move card to Ready + notify waiter
- Audio alert: play `<audio>` chime on `order:new` event
- Priority pin: tap flag icon → card moves to top of column (stored in local component state)
- No login required on KDS screen — join socket on page load with a pre-configured KDS token

---

## PHASE 3 — Extended Modules (Weeks 13–18)

### Step 9: Bar Module (Weeks 13–14)

**Backend:**
- Orders with `type = 'bar'` route to bar socket room: `io.to('bar').emit('order:new', ...)`
- Happy-hour pricing logic: if `NOW()` is between `menu_items.happy_hour_start` and `happy_hour_end`, use `happy_hour_price` instead of `price`
- Beverage inventory: deduct stock on each confirmed drink order via `stock_movements` (delta = -quantity)

**Frontend — Bar Display Screen:**
- Same KDS layout as kitchen but subscribed to `bar` socket room
- Happy-hour countdown timer: show remaining time in happy hour as `HH:MM:SS` when active (amber banner)
- Beverage stock widget: collapsible sidebar showing current stock level per drink item
- Alert badge on items at or below `min_threshold`

**React Query hooks:**
- `useBarOrders()` — live bar order list
- `useHappyHour()` — current happy hour status + countdown

### Step 10: Butcher Module (Weeks 14–15)

**Special pricing logic (backend):**
- `order_items.weight_kg` stores the weighed amount (DECIMAL 8,3)
- `line_total = menu_items.price × order_items.weight_kg`
- Different cuts of the same animal = separate `menu_items` records with separate prices
- No barcode: item selection via text search (name_en / name_am / category)
- Daily summary endpoint: `GET /api/v1/reports/butcher/daily?date=YYYY-MM-DD`
  - Returns: total kg sold per category, total revenue, item breakdown

**Frontend — Butcher Screen:**
- Search bar at top — real-time filter by meat type and cut name
- Item selected → numeric weight input modal (decimal keypad, shows ETB calculation live: `X kg × Y ETB/kg = Z ETB`)
- Running order tally: item name, weight, calculated price, remove button
- "Confirm Sale" → creates order + order_items with weight_kg → generates bill immediately (no table needed)
- Daily summary footer: total kg and revenue updated in real-time

### Step 11: Grocery Module (Weeks 15–16)

**Frontend — Grocery POS Screen:**
- Search by item name, category, or SKU code (text input — no barcode)
- Item cards: name (EN/AM), price/unit, current stock level badge
- Quick-add row for top 8 most-sold items (ordered by `stock_movements` frequency)
- Packaged goods sold by unit (piece, pack, bottle)
- Cart sidebar: item list, quantities, subtotal, checkout button

**Supplier Management (admin/store manager only):**
- CRUD UI for suppliers: name, contact phone, module, items they supply
- "Receive Stock" form: select supplier, select items, enter quantities → creates `stock_movements` (delta = +quantity)
- Reorder alerts page: list all items at or below `min_threshold` with supplier info

**Backend routes:**
```
GET    /api/v1/inventory                  → All items with current stock [StoreManager, Admin]
POST   /api/v1/inventory/receive          → Receive stock from supplier [StoreManager]
GET    /api/v1/inventory/alerts           → Items at or below min_threshold [StoreManager, Admin]
GET    /api/v1/suppliers                  → List suppliers [StoreManager, Admin]
POST   /api/v1/suppliers                  → Create supplier [Admin]
PATCH  /api/v1/suppliers/:id              → Update supplier [Admin]
```

### Step 12: Hotel Rooms Module (Weeks 16–17)

**Backend routes:**
```
GET    /api/v1/rooms                       → All rooms with status [Cashier, Admin]
POST   /api/v1/bookings                    → New booking [Cashier]
PATCH  /api/v1/bookings/:id/checkin        → Check in guest → room status → occupied [Cashier]
PATCH  /api/v1/bookings/:id/checkout       → Check out → calculate final bill [Cashier]
GET    /api/v1/bookings/:id/charges        → All charges for booking [Cashier]
POST   /api/v1/bookings/:id/charges        → Add charge to guest tab [Cashier]
GET    /api/v1/rooms/occupancy             → Occupancy dashboard data [Admin, Manager]
```

**Check-out calculation:**
```
nights = checkout_date - checkin_date (days)
room_total = rate_per_night × nights
final_total = room_total + SUM(guest_charges.amount)
```
Auto-generate bill → proceed to payment flow (same POS payment screen).

**Frontend — Hotel Dashboard (Tailwind):**
- Room grid: cards per room showing room number, type, floor, status badge (green/red/grey)
- Tap available room → booking form (guest name, phone, check-in/out dates, rate confirmation)
- Tap occupied room → booking detail with: guest name, check-in date, nights so far, current charges list, "Add Charge" button, "Check Out" button
- Occupancy summary bar: % occupied today, revenue today, rooms available count
- Occupancy dashboard: chart of occupancy % by week/month

### Step 13: Reporting & Analytics (Weeks 17–18)

**Backend routes:**
```
GET  /api/v1/reports/revenue          → Revenue by module + date range [Admin, Manager]
GET  /api/v1/reports/bestsellers      → Top items by qty and revenue [Admin, Manager]
GET  /api/v1/reports/staff            → Orders/bills per staff member [Admin, Manager]
GET  /api/v1/reports/inventory        → Stock movement history + current levels [Admin, StoreManager]
GET  /api/v1/reports/daily-summary    → Full daily financial summary [Admin, Manager]
GET  /api/v1/reports/butcher/daily    → Butcher daily kg + revenue summary [Admin, Manager]
POST /api/v1/reports/close-day        → Lock the day, write daily_summaries record [Manager]
```

**Frontend — Reports Dashboard (Tailwind, admin/manager only):**
- Revenue bar chart (use Recharts or Chart.js): grouped by module — Restaurant / Bar / Butcher / Grocery / Rooms
- Date range selector: Today / This Week / This Month / Custom range
- Bestsellers table: rank, item name (EN/AM), qty sold, total revenue
- Staff performance table: name, role, orders handled, revenue processed
- Inventory movement table: item name, opening stock, in, out, closing stock
- "Close Day" button → prompts cashier to enter physical cash count → shows variance → confirms → `POST /api/v1/reports/close-day` → locks day's transactions

---

## PHASE 4 — Testing & Refinement (Weeks 19–22)

### Step 14: Unit Tests (Week 19)

Use **Jest + Supertest**. Write tests for:
- All `/api/v1/` endpoints — happy path + error cases
- JWT: token generation, expiry (15min), refresh flow, invalid token rejection
- RBAC middleware: each role against each route (assert 200 for allowed, 403 for denied)
- Sequelize model validations: required fields, ENUM values, foreign key constraints
- Bill calculation: subtotal, discount, tax, total, split amounts
- Butcher line_total: `price × weight_kg` at various decimal precisions
- Happy-hour pricing: time-based price switching

### Step 15: Integration Tests (Weeks 19–20)

Test the full end-to-end order lifecycle:
1. Waiter logs in → token issued (15min expiry)
2. Waiter creates order on table → `POST /api/v1/orders`
3. Assert Socket.io emits `order:new` to `kitchen` room
4. Kitchen marks item ready → `item:status` event
5. Assert waiter receives `order:updated` with status `ready`
6. Cashier generates bill → `POST /api/v1/bills`
7. Cashier records cash payment → `POST /api/v1/payments`
8. Assert `stock_movements` record created (inventory deducted)
9. Assert receipt data available at `GET /api/v1/receipts/:id`
10. Assert `audit_log` has records for all write operations

Also test:
- Token refresh: wait 15min (mock timer) → assert 401 → refresh → retry succeeds
- `table:status` event fires when table status changes
- `sync:ack` event fires after `POST /api/v1/sync` succeeds

### Step 16: Offline / Sync Tests (Week 20)

**Dexie.js IndexedDB schema (`/src/db/schema.js`):**
```javascript
import Dexie from 'dexie';
const db = new Dexie('SmartHMSOffline');
db.version(1).stores({
  pending_orders: '++localId, tableId, createdAt, synced',
  menu_cache: 'id, module, updatedAt',
  sync_queue: '++id, entity, payload, deviceId, createdAt, syncedAt'
});
export default db;
```

**Sync Manager (`/src/db/syncManager.js`):**
```javascript
import db from './schema';
import api from '../utils/api';

let syncTimeout = null;

window.addEventListener('online', () => {
  // Debounce: attempt sync within 30 seconds of reconnect
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(syncPendingData, 2000); // start after 2s stabilization
});

async function syncPendingData() {
  const pending = await db.sync_queue.where('syncedAt').equals(null).toArray();
  if (!pending.length) return;

  try {
    const res = await api.post('/api/v1/sync', {
      deviceId: getDeviceId(),
      items: pending.map(p => ({ id: p.id, entity: p.entity, payload: p.payload }))
    });

    // Mark synced items
    const syncedIds = res.data.syncedIds;
    await db.sync_queue
      .where('id').anyOf(syncedIds)
      .modify({ syncedAt: new Date().toISOString() });

    // socket:ack is also received — no action needed, DB already updated
  } catch (err) {
    // Retry in 10 seconds
    syncTimeout = setTimeout(syncPendingData, 10000);
  }
}
```

**Server sync endpoint (`/backend/routes/sync.js`):**
```
POST /api/v1/sync
Body: { deviceId, items: [{ id, entity, payload }] }
→ For each item: upsert into the appropriate table based on entity type
→ Record in server-side sync_queue (synced_at = NOW())
→ Emit sync:ack to the device's socket: { syncedIds, timestamp }
→ Return: { syncedIds }
```

**Offline test procedure:**
1. Simulate offline: mock `navigator.onLine = false`, block all fetch calls
2. Place 3 orders via waiter UI
3. Assert orders saved in Dexie `sync_queue` with `syncedAt = null`
4. Assert "Offline — orders queued" banner visible
5. Restore network: `navigator.onLine = true`, fire `online` event
6. Assert sync manager calls `POST /api/v1/sync` within 30 seconds
7. Assert all 3 orders appear in MySQL `orders` table
8. Assert `sync_queue.syncedAt` is not null for all 3
9. Assert KDS received all 3 via `order:new` socket events

### Step 17: WebSocket & Performance Tests (Week 20)

- Confirm Socket.io WebSocket upgrade on Yegara VPS (check response headers for `Upgrade: websocket`)
- Simulate long-poll fallback: force `transports: ['polling']` in client → verify orders still route to KDS
- Load test (use Artillery or k6): 50 concurrent virtual users, 1000 orders/hour for 10 minutes
- Assert all performance SLAs:
  - Waiter places order → KDS receives `order:new`: **< 2 seconds**
  - `POST /api/v1/bills` response time: **< 1 second**
  - `GET /api/v1/reports/revenue` dashboard load: **< 3 seconds**
- Verify Sequelize connection pool handles peak load (check pool queue depth in logs)

### Step 18: UAT Test Scripts (Weeks 21–22)

Provide these step-by-step scripts to client staff:

**Waiter:** Open browser on tablet → login with PIN → select table on floor map → search "ጥብስ" (Amharic) → add 2 items → send order → wait for "Order Ready" notification → confirm delivery → generate bill

**Cashier:** Open bill for table → verify items → select "Telebirr" → enter reference number from customer phone → confirm → print receipt in Amharic

**Cashier — Split bill:** Open bill → tap "Split Bill" → assign 3 items to Payer 1 (cash) → remaining to Payer 2 (CBE Birr + reference) → confirm both → print 2 receipts

**Kitchen:** Open KDS on monitor → receive new order (audio alert) → tap item → mark "Preparing" → tap "Mark Ready" → verify waiter tablet shows notification

**Bar:** Open Bar Display → receive drink order → mark ready → verify stock level updated

**Butcher:** Login → search "ሬሳ" → tap item → enter 1.75 kg → verify ETB total calculated → confirm sale → receipt generated

**Receptionist:** Login → Rooms → tap available room → fill booking form (guest name, phone, dates) → confirm → check in → add room service charge → check out → view final bill → process payment

**Manager:** Login → Reports → select "Today" → verify revenue by module → tap "Close Day" → enter cash count → confirm → verify day locked

---

## PHASE 5 — Deployment & Training (Weeks 23–24)

### Step 19: Yegara VPS Setup (Ubuntu 22.04 LTS)

```bash
# 1. Connect to Yegara VPS
ssh root@your-yegara-ip

# 2. Update system
apt update && apt upgrade -y

# 3. Install Node.js v20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v  # should output v20.x.x

# 4. Install PM2, Nginx, Certbot
npm install -g pm2
apt install -y nginx certbot python3-certbot-nginx

# 5. Install MySQL 8.x
apt install -y mysql-server
mysql_secure_installation

# 6. Clone / upload project
git clone https://github.com/your-org/smarthms.git /var/www/smarthms
# OR upload via scp:
# scp -r ./backend root@your-yegara-ip:/var/www/smarthms/
# scp -r ./frontend root@your-yegara-ip:/var/www/smarthms/

# 7. Install backend dependencies and start
cd /var/www/smarthms/backend
cp .env.production .env          # use production env values
npm install --production
pm2 start server.js --name smarthms-api
pm2 startup && pm2 save

# 8. Build React frontend and copy to public
cd /var/www/smarthms/frontend
npm install
npm run build
mkdir -p /var/www/smarthms/public
cp -r build/. /var/www/smarthms/public/
```

### Step 20: Nginx Configuration

Create `/etc/nginx/sites-available/smarthms`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/smarthms/public;
    index index.html;

    # React SPA — all routes fall back to index.html
    location / {
        try_files $uri /index.html;
    }

    # API proxy — all /api/v1/ traffic to Node.js
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 60s;
    }

    # Socket.io proxy — must support WebSocket upgrade
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and activate:
```bash
ln -s /etc/nginx/sites-available/smarthms /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Enable HTTPS (mandatory — required for PWA service workers and payment references)
certbot --nginx -d yourdomain.com -d www.yourdomain.com
systemctl enable certbot.timer   # auto-renew SSL
```

### Step 21: Database Setup on Production

```bash
mysql -u root -p
CREATE DATABASE smarthms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'smarthms_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON smarthms_db.* TO 'smarthms_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Create backup directory
mkdir -p /var/backups/smarthms

# Run Sequelize migrations and seeders
cd /var/www/smarthms/backend
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
# Seeds: default roles & permissions, superadmin user, room types, menu categories
```

### Step 22: Scheduled Backup + Uptime Monitoring

**Automated MySQL backup (crontab -e):**
```bash
# Daily backup at 2:00 AM
0 2 * * * mysqldump -u smarthms_user -pyour_password smarthms_db > /var/backups/smarthms/smarthms_$(date +\%F).sql

# Keep only last 30 days
0 3 * * * find /var/backups/smarthms/ -name "*.sql" -mtime +30 -delete
```

**Uptime monitoring:**
- Register the domain at **UptimeRobot** (free tier): https://uptimerobot.com
- Add HTTP monitor for `https://yourdomain.com/api/v1/health`
- Add backend health endpoint: `GET /api/v1/health → { status: 'ok', timestamp }`
- Set alert contacts: manager email + WhatsApp (via UptimeRobot alert integration)
- Target: 99.5% uptime SLA on Yegara VPS

### Step 23: Go-Live Checklist

Verify every item before client signs Go-Live Acceptance Form:

**Infrastructure:**
- [ ] Yegara VPS running Ubuntu 22.04 LTS, PM2 shows `smarthms-api` as `online`
- [ ] HTTPS active — green padlock, Let's Encrypt certificate valid
- [ ] `GET /api/v1/health` returns `{ status: 'ok' }` over HTTPS
- [ ] UptimeRobot monitor active and alerting to correct contacts
- [ ] Daily backup cron running — `/var/backups/smarthms/` has today's `.sql` file

**Authentication & Access:**
- [ ] All roles login successfully: superadmin, manager, cashier, waiter, kitchen, bar, butcher, grocery, receptionist
- [ ] JWT 15-min expiry confirmed — access token refreshes automatically without logout
- [ ] Language toggle works: EN ↔ AM on login page and throughout UI

**Module verification:**
- [ ] POS: cash payment completes, receipt displays/prints in Amharic and English
- [ ] POS: Telebirr reference number accepted and stored in `payments` table
- [ ] POS: CBE Birr reference number accepted and stored in `payments` table
- [ ] POS: split bill — 2 payers, different methods, 2 receipts generated
- [ ] Waiter: floor map renders all tables with correct colors
- [ ] Waiter: `table:status` socket event updates floor map in real-time across 2 devices
- [ ] Socket.io: waiter places order → KDS shows card within **2 seconds**
- [ ] KDS: audio alert fires on new order
- [ ] KDS: "Mark Ready" → waiter tablet shows notification within 2 seconds
- [ ] Bar display: drink orders appear separately from kitchen orders
- [ ] Butcher: per-kg sale — weight × price calculated correctly, receipt generated
- [ ] Grocery: stock deducted after sale, reorder alert fires at `min_threshold`
- [ ] Hotel: check-in → add room charge → check-out → final bill = room rate × nights + charges
- [ ] Reports: daily revenue chart shows correct figures by module
- [ ] Close Day: day locked, `daily_summaries` record written, cash variance calculated

**Offline / Sync:**
- [ ] Turn off WiFi on waiter tablet → "Offline" banner appears
- [ ] Place 1 order while offline → confirm saved in IndexedDB
- [ ] Reconnect WiFi → order syncs to server within **30 seconds**
- [ ] `sync:ack` received → offline banner disappears
- [ ] KDS receives the synced order

**Sign-off:**
- [ ] Client staff complete all UAT scripts without errors
- [ ] All P1/P2 bugs resolved
- [ ] User manuals (Amharic + English) delivered
- [ ] Client signs **Go-Live Acceptance Form**

---

## APPENDIX A: Permissions Matrix

| Module | Superadmin | Manager | Cashier | Waiter | Kitchen | Bar | Butcher | Grocery | Receptionist |
|---|---|---|---|---|---|---|---|---|---|
| POS / Billing | Full | Full | Full | View | None | None | Partial | Partial | Full |
| Table Management | Full | Full | View | Full | View | View | None | None | None |
| Kitchen Orders | Full | Full | None | Place | Manage | None | None | None | None |
| Bar Orders | Full | Full | None | Place | None | Manage | None | None | None |
| Butcher Sales | Full | Full | Full | None | None | None | Full | None | None |
| Hotel Rooms | Full | Full | Full | None | None | None | None | None | Full |
| Inventory | Full | Full | View | None | View | View | Partial | Full | None |
| Reports | Full | Full | Daily | None | None | None | None | Store | None |
| User Management | Full | None | None | None | None | None | None | None | None |

---

## APPENDIX B: Support SLA

| Priority | Example | Response | Resolution |
|---|---|---|---|
| P1 Critical | System completely down | 2 hours | 4 hours or workaround |
| P2 High | Module not working | 4 hours | Next business day |
| P3 Normal | Minor bug or question | 24 hours | 3 business days |
| P4 Low | Enhancement request | 72 hours | Next quarterly release |

Support channels: WhatsApp group (fastest) · Email: support@ilinkhms.et · Phone: P1/P2 only

---

## APPENDIX C: Post Go-Live Maintenance Schedule

| Activity | Frequency | Action |
|---|---|---|
| Security patches | Monthly | SSH → `apt update && apt upgrade` + `npm audit fix` during off-hours |
| Software updates | Quarterly | `git pull → npm install → npm run build → pm2 restart smarthms-api` |
| DB optimization | Monthly | Review MySQL slow query log, rebuild indexes, clean soft-deleted records |
| Backup verification | Monthly | Test restore of latest `.sql` dump to a staging DB |
| SSL certificate | Auto | Certbot timer auto-renews Let's Encrypt cert — verify with `certbot renew --dry-run` |
| Staff refresher | Bi-annual | 2-hour on-site session: new features walkthrough + onboard new staff |

---

*SmartHMS Codex Prompt v2.0 — Updated from Master Proposal · 24 Weeks · 5 Phases · 7 Modules · Ubuntu 22.04 LTS · /api/v1/ · JWT 15min · Tailwind CSS · React Query*
