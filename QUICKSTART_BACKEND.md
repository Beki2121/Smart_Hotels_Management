# Quick Start Guide - Smart HMS Backend

## Prerequisites

- Node.js (v14+)
- MariaDB 10.5+
- npm or yarn

---

## 1️⃣ Installation

```bash
cd backend
npm install
```

---

## 2️⃣ Database Setup

**The database tables are already created.** Just verify your connection settings in `.env`:

```bash
DB_HOST=localhost
DB_USER=ilinkmth_smarthms
DB_PASS=n?Y;.P@aZM8RITbd
DB_NAME=ilinkmth_smarthms
DB_PORT=3306
```

---

## 3️⃣ Seed Demo Data (Optional)

```bash
npm run seed:demo
```

This creates:

- 6 test users (admin, manager, waiter, cashier, kitchen, receptionist)
- 5 menu categories
- 7 menu items
- 6 restaurant tables
- 4 room types + 7 rooms
- 3 suppliers + 5 inventory items

**Default Credentials**:

- Username: `Admin User`
- Password: `admin123`
- PIN: `1234` (for other users with username like "Waiter John")

---

## 4️⃣ Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:5000`

---

## 5️⃣ Test the API

### Health Check

```bash
curl http://localhost:5000/api/v1/health
```

### Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Admin User",
    "password": "admin123"
  }'
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "role": "superadmin",
    "language_pref": "en"
  }
}
```

### Use the Token

```bash
curl -X GET http://localhost:5000/api/v1/users \
  -H "Authorization: Bearer <accessToken>"
```

---

## 📚 API Endpoints

### Authentication

- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Users

- `GET /api/v1/users` - List users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/:id` - Get user
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Menu

- `GET /api/v1/categories` - List categories
- `GET /api/v1/menu-items` - List menu items
- `POST /api/v1/menu-items` - Create menu item

### Tables

- `GET /api/v1/tables` - List tables
- `POST /api/v1/tables` - Create table

### Orders

- `GET /api/v1/orders` - List orders
- `POST /api/v1/orders` - Create order
- `POST /api/v1/orders/:id/items` - Add items to order

### Bills & Payments

- `GET /api/v1/bills` - List bills
- `POST /api/v1/bills` - Generate bill
- `POST /api/v1/payments` - Record payment

### Rooms & Bookings

- `GET /api/v1/rooms` - List rooms
- `GET /api/v1/bookings` - List bookings
- `POST /api/v1/bookings` - Create booking

### Inventory

- `GET /api/v1/inventory` - List inventory
- `POST /api/v1/inventory` - Create inventory item

### Reports

- `GET /api/v1/reports/daily` - Daily summary
- `POST /api/v1/reports/close-day` - Close business day

---

## 🧪 Postman Collection

Import this to Postman for easy testing:

```json
{
  "info": {
    "name": "SmartHMS API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "http://localhost:5000/api/v1/auth/login",
            "body": {
              "raw": "{\"username\": \"Admin User\", \"password\": \"admin123\"}"
            }
          }
        }
      ]
    }
  ]
}
```

---

## 🔧 Environment Variables

Edit `.env` to configure:

```bash
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=ilinkmth_smarthms
DB_PASS=n?Y;.P@aZM8RITbd
DB_NAME=ilinkmth_smarthms

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Frontend
FRONTEND_URL=http://localhost:3000
```

---

## 📝 Useful Commands

```bash
# Development
npm run dev           # Start with nodemon

# Database
npm run seed:demo     # Seed demo data
npm run migrate       # Run migrations

# Production
NODE_ENV=production npm start

# Testing
node test-models.js   # Test model loading
```

---

## 🐛 Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

✅ Check MariaDB is running
✅ Verify credentials in .env
✅ Check database name: `ilinkmth_smarthms`

### JWT Secret Not Found

```
Error: secretOrPrivateKey must be a non-empty string
```

✅ Make sure JWT_SECRET is in .env
✅ Restart the server after changing .env

### Cannot Find Module 'db'

```
Error: Cannot find module '../db'
```

✅ Run `npm install` first
✅ Check file paths are correct

---

## 📖 Documentation

- Full API: See `PHASE_2_COMPLETE.md`
- Implementation: See `PHASE_2_IMPLEMENTATION_SUMMARY.md`
- Database Schema: See `database-mariadb.sql`

---

## ✅ Ready for Frontend!

Once the backend is running and tested, you can start PHASE 3:

- React frontend at `http://localhost:3000`
- Connect to API at `http://localhost:5000`
- Import `frontend/api.js` for axios client

---

**Last Updated**: 2026-05-18  
**Backend Version**: 1.0.0  
**Status**: ✅ Ready
