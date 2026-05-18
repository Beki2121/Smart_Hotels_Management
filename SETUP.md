# Smart HMS — Setup Instructions (PHASE 1 Complete)

## 📋 What's Been Created

### ✅ Backend (`/backend`)

- **Configuration**: `.env`, `database.js`, `.sequelizerc`
- **Server**: `server.js` with Express, Socket.io, CORS setup
- **Middleware**: Auth, RBAC, Audit logging
- **Routes**: Placeholder routes for all 12 modules (auth, users, menu, tables, orders, bills, payments, receipts, rooms, bookings, inventory, suppliers, reports)
- **Socket.io**: Basic event handlers for orders, tables, KDS items
- **Database Migrations**: 19 migration files for all 19 tables

### ✅ Frontend (`/frontend`)

- **Utilities**: i18n (translations), formatCurrency, socket.js, api.js (with axios + interceptors)
- **Package.json**: With React 18, Tailwind, Zustand, React Query, React Router, Socket.io client

### ✅ Folder Structure

```
smarthms/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── sockets.js
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── [19 migration files]
└── frontend/
    ├── [utilities: i18n, formatCurrency, socket, api]
    └── package.json (ready for npm install)
```

---

## 🚀 Next Steps: Installation & Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 3. Set Up Database

#### Create MySQL Database

```sql
CREATE DATABASE smarthms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Update `.env` with Your Database Credentials

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=smarthms
```

#### Run Migrations

```bash
cd backend
npm run migrate
```

### 4. Seed Initial Data (Optional - for testing)

```bash
npm run seed
```

---

## 🔧 Configuration

### Backend `.env` Variables

- `PORT`: 5000
- `NODE_ENV`: development / production
- `DB_*`: Database connection
- `JWT_SECRET`: 32+ character random string (change in production!)
- `JWT_REFRESH_SECRET`: Different 32+ character string
- `FRONTEND_URL`: Where your React app runs (http://localhost:3000 for dev)

### Frontend Environment Variables

Create `frontend/.env` (or `.env.local`):

```env
REACT_APP_API_URL=http://localhost:5000
```

---

## ▶️ Running the System

### Terminal 1: Start Backend

```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

Expected output:

```
✓ SmartHMS API running on port 5000
✓ Environment: development
✓ Frontend URL: http://localhost:3000
```

### Terminal 2: Start Frontend

```bash
cd frontend
npm start  # Runs React dev server
```

Opens at `http://localhost:3000`

### Test API Health

```bash
curl http://localhost:5000/api/v1/health
```

---

## 📊 Database Schema

All 19 tables have been created with:

- ✅ Proper foreign keys and indexes
- ✅ UTF8MB4 charset for multilingual support (future Amharic)
- ✅ Soft deletes (paranoid: true) for audit tables
- ✅ Timestamps (created_at, updated_at)

Tables:

1. users
2. categories
3. menu_items
4. modifiers
5. tables
6. orders
7. order_items
8. bills
9. payments
10. receipts
11. room_types
12. rooms
13. bookings
14. guest_charges
15. inventory_items
16. stock_movements
17. suppliers
18. daily_summaries
19. audit_logs

---

## 🛠️ Architecture Notes

- **API Prefix**: All routes use `/api/v1/` (e.g., `/api/v1/auth/login`)
- **Auth**: JWT + refresh tokens (15m access, 30d refresh)
- **RBAC**: 9 roles enforced via middleware
- **Real-time**: Socket.io for order routing, table status, KDS
- **i18n**: Translation wrapper ready for Amharic (just add translation file)
- **Currency**: All amounts formatted as ETB

---

## 📝 What's Next (PHASE 2)

- Implement Sequelize models for all 19 tables
- Complete authentication (login, refresh, logout)
- Implement all route handlers
- Add validation (express-validator)
- Test with Postman

---

## ⚠️ Important

- **Never commit `.env` to git** — use `.env.example` for reference
- Change `JWT_SECRET` and `JWT_REFRESH_SECRET` in production
- For Yegara cPanel deployment: Will add deployment guide in Phase 2

---

**Status**: PHASE 1 ✅ Complete  
**Next Phase**: PHASE 2 — Backend Core Implementation
