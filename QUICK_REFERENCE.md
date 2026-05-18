# Smart HMS — Quick Reference Card

## 🚀 Quick Start Commands

```bash
# Setup Backend
cd backend
npm install
npm run migrate        # Run all migrations
npm run seed          # Seed initial data
npm run dev           # Start server (with nodemon)

# Setup Frontend
cd ../frontend
npm install
npm start             # Run React dev server

# Reset Database
cd backend
npm run migrate:undo  # Rollback all migrations
npm run migrate       # Re-run all migrations
```

## 🔗 API Base URL

- **Development**: `http://localhost:5000/api/v1/`
- **Production**: `https://yourdomain.com/api/v1/`

## 📋 Available Endpoints

### Auth

- `POST /auth/login` — Login with username/password or PIN
- `POST /auth/refresh` — Get new access token
- `POST /auth/logout` — Logout

### Users

- `GET /users` — List users (admin only)
- `POST /users` — Create user (admin only)

### Menu

- `GET /menu-items` — List menu items
- `GET /categories` — List categories by module

### Orders & Billing

- `GET /orders` — List orders
- `POST /orders` — Create order
- `GET /bills` — List bills
- `POST /bills` — Generate bill from order
- `POST /payments` — Record payment
- `GET /receipts/{billId}` — Get receipt

### Rooms

- `GET /rooms` — List rooms
- `POST /bookings` — Create booking
- `GET /bookings` — List bookings

### Reports

- `GET /reports/daily` — Daily summary
- `POST /reports/close-day` — Close business day

## 🛡️ User Roles (9 total)

| Role             | Modules                                       | Notes                   |
| ---------------- | --------------------------------------------- | ----------------------- |
| **superadmin**   | All                                           | Full system control     |
| **manager**      | All except user deletion                      | Day-to-day management   |
| **cashier**      | POS, Billing, Rooms checkout, Reports (daily) | Handles payments        |
| **waiter**       | Tables, Order entry, Own orders               | Takes restaurant orders |
| **kitchen**      | KDS screen (view only)                        | Kitchen Display System  |
| **bar**          | Bar display (view only)                       | Bar orders              |
| **butcher**      | Butcher POS only                              | Per-kg pricing          |
| **grocery**      | Grocery POS + Inventory                       | Packaged goods          |
| **receptionist** | Rooms, Bookings, Guest charges                | Hotel operations        |

## 💾 Database

### 19 Tables

Users → Categories → Menu Items → Tables → Orders → Bills → Payments  
Rooms → Bookings → Guest Charges → Inventory → Stock Movements → Suppliers → Daily Summaries → Audit Logs

### Soft Deletes (⚡ marked tables)

- users, menu_items, orders, bills, rooms, bookings

### All tables have:

- `id` (INTEGER AUTO_INCREMENT PRIMARY KEY)
- `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (DATETIME AUTO_UPDATE CURRENT_TIMESTAMP)

## 🔐 Authentication

### Token Strategy

```
Login → accessToken (15 min) + refreshToken (30 days) + refreshToken_hash stored in DB

Access denied (401) → Call /auth/refresh with refreshToken → New accessToken

Refresh fails → Logout → Redirect to /login
```

### Header Format

```
Authorization: Bearer <accessToken>
```

## 📱 Frontend Structure (Ready for PHASE 3)

```
frontend/src/
├── pages/           ← One file per screen
├── components/      ← Reusable UI components
├── store/          ← Zustand stores (auth, cart, socket)
├── hooks/          ← React Query data hooks
├── utils/          ← Helpers (i18n, formatCurrency, api, socket)
├── App.jsx         ← Router + providers
└── index.js        ← Entry point
```

## 🔌 Socket.io Events

```javascript
// Client → Server
socket.emit('order:new', { orderId, items... })
socket.emit('order:updated', { orderId, status... })
socket.emit('table:status', { tableId, status... })
socket.emit('item:status', { itemId, status... })

// Server → All Clients
socket.on('order:new', (data) => { /* update UI */ })
socket.on('order:updated', (data) => { /* refresh */ })
socket.on('table:status', (data) => { /* update table */ })
socket.on('item:status', (data) => { /* KDS update */ })
```

## 💰 Currency Formatting

```javascript
import { formatETB } from "./utils/formatCurrency";

formatETB(1250); // "ETB 1,250.00"
formatETB(0); // "ETB 0.00"
formatETB(null); // "ETB 0.00"
```

## 🌍 i18n Translation

```javascript
import { t } from "./utils/i18n";

t("login.title"); // "Smart HMS Login"
t("nav.pos"); // "POS & Billing"
t("bill.total"); // "Total"
t("common.offline"); // "No internet connection — please reconnect"
```

**To add Amharic later**: Add `'am'` object to `translations` in `i18n.js`, add language selector to profile page.

## 🔍 RBAC Middleware

```javascript
// Usage in routes:
router.get(
  "/admin-only",
  authenticate,
  checkRole("superadmin", "manager"),
  handler,
);

// Returns 403 if user role not in allowed list
// Returns 401 if no token provided
```

## 🧪 Test Health Endpoint

```bash
curl http://localhost:5000/api/v1/health

# Response:
{
  "status": "ok",
  "timestamp": "2026-05-18T09:00:00.000Z",
  "message": "SmartHMS API is running"
}
```

## 📝 Environment Variables

### Backend (.env)

```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASS=password
DB_NAME=smarthms
JWT_SECRET=your_32_char_minimum_secret
JWT_EXPIRES_IN=15m
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env or .env.local)

```
REACT_APP_API_URL=http://localhost:5000
```

## ⚡ Performance Notes

- Connection pool: min 2, max 10 (configurable in .env)
- JWT access token: 15 minutes (fast refresh on expiry)
- Soft deletes: Use `paranoid: true` to preserve audit trail
- Socket.io: Falls back to polling if WebSocket unavailable

## 📋 Checklist: Before Going Live

- [ ] Change JWT_SECRET and JWT_REFRESH_SECRET to long random strings
- [ ] Set NODE_ENV=production
- [ ] Update FRONTEND_URL to production domain
- [ ] Update DB credentials for production server
- [ ] Test all migrations: `npm run migrate`
- [ ] Verify audit logging working
- [ ] Test token refresh flow
- [ ] Test RBAC on all routes
- [ ] Load test with concurrent users
- [ ] Set up SSL certificate via cPanel

## 🆘 Common Issues

**Connection refused on localhost:5000**  
→ Backend not running: `cd backend && npm run dev`

**403 Access Denied**  
→ User role not in allowed roles for that endpoint

**401 Invalid token**  
→ Token expired or malformed. Call `/auth/refresh`

**Socket not connecting**  
→ Check CORS in server.js matches FRONTEND_URL

---

**Need help?** Check SETUP.md or PHASE_1_SUMMARY.md
