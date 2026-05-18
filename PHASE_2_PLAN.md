# PHASE 2 IMPLEMENTATION PLAN — Backend Core

## Overview

**Phase**: PHASE 2 - Backend Core  
**Estimated Duration**: Weeks 5-12  
**Status**: Starting now  
**Previous Phase**: PHASE 1 ✅ Complete (Database + Infrastructure)

---

## PHASE 2 Goals

1. ✅ Create Sequelize models for all 19 tables
2. ✅ Implement complete authentication system (login, refresh, logout)
3. ✅ Write route handlers for all 13 API modules
4. ✅ Add input validation (express-validator)
5. ✅ Seed initial data (test users, categories, menu items)
6. ✅ Test all endpoints with Postman

---

## Work Breakdown Structure

### STEP 1: Sequelize Models (All 19 tables)

- Create ORM model files with associations
- Define model hooks (password hashing, timestamps)
- Set up relationships (foreign keys, joins)
- Duration: 2-3 days

### STEP 2: Authentication System

- Implement auth middleware (JWT verification)
- Implement RBAC middleware (role-based access)
- Implement audit middleware (action logging)
- Complete auth routes (login, refresh, logout)
- Duration: 1-2 days

### STEP 3: Core Route Handlers

- Implement handlers for 13 API modules
- Add request validation
- Add error handling
- Add response formatting
- Duration: 4-5 days

### STEP 4: Seeder Data

- Create sample users (all 9 roles)
- Create sample categories and menu items
- Create sample tables
- Create sample room types and rooms
- Duration: 1 day

### STEP 5: Testing & Validation

- Test all endpoints with Postman
- Test authentication flow
- Test RBAC enforcement
- Test error handling
- Duration: 2-3 days

---

## Detailed Implementation Steps

### A. Sequelize Models (19 files)

**Files to create:**

```
backend/models/
├── index.js
├── User.js
├── Category.js
├── MenuItem.js
├── Modifier.js
├── Table.js
├── Order.js
├── OrderItem.js
├── Bill.js
├── Payment.js
├── Receipt.js
├── RoomType.js
├── Room.js
├── Booking.js
├── GuestCharge.js
├── InventoryItem.js
├── StockMovement.js
├── Supplier.js
├── DailySummary.js
└── AuditLog.js
```

**Key Features:**

- Define attributes matching database schema
- Add validation rules
- Add associations (belongsTo, hasMany, etc.)
- Add hooks (bcrypt password hashing)

### B. Route Handlers (13 modules)

**Auth Routes** (`POST /api/v1/auth/*`)

- POST /login → authenticate with password/PIN
- POST /refresh → get new access token
- POST /logout → invalidate refresh token

**Users Routes** (`GET|POST|PATCH|DELETE /api/v1/users/*`)

- GET /users → list users (admin only)
- POST /users → create user (admin only)
- PATCH /users/:id → update user (admin/self)
- DELETE /users/:id → delete user (admin only)

**Menu Routes** (`GET|POST|PATCH|DELETE /api/v1/menu-items|categories`)

- GET /categories → list categories
- GET /menu-items → list items with search/filter
- POST /menu-items → create item (admin/manager)
- PATCH /menu-items/:id → update item
- DELETE /menu-items/:id → soft delete item

**Tables Routes** (`GET|POST|PATCH /api/v1/tables/*`)

- GET /tables → list restaurant tables
- POST /tables → create table
- PATCH /tables/:id → update table status

**Orders Routes** (`GET|POST|PATCH /api/v1/orders/*`)

- GET /orders → list orders (with filters)
- POST /orders → create order
- POST /orders/:id/items → add items to order
- PATCH /orders/:id/status → update order status
- PATCH /orders/:id → cancel order (soft delete)

**Bills Routes** (`GET|POST /api/v1/bills/*`)

- GET /bills → list bills
- POST /bills → generate bill from order
- POST /bills/:id/void → void a bill

**Payments Routes** (`GET|POST /api/v1/payments/*`)

- GET /payments → list payments
- POST /payments → record payment (cash/telebirr/cbe)

**Receipts Routes** (`GET /api/v1/receipts/*`)

- GET /receipts/:billId → get receipt
- POST /receipts/:billId → generate receipt

**Rooms Routes** (`GET|POST|PATCH /api/v1/rooms/*`)

- GET /rooms → list rooms
- PATCH /rooms/:id/status → update room status

**Bookings Routes** (`GET|POST|PATCH /api/v1/bookings/*`)

- GET /bookings → list bookings
- POST /bookings → create booking
- PATCH /bookings/:id/check-in → check in guest
- PATCH /bookings/:id/check-out → check out guest
- POST /bookings/:id/charges → add charge

**Inventory Routes** (`GET|POST|PATCH /api/v1/inventory/*`)

- GET /inventory → list stock items
- POST /inventory/:itemId/movements → record stock movement

**Suppliers Routes** (`GET|POST|PATCH /api/v1/suppliers/*`)

- GET /suppliers → list suppliers
- POST /suppliers → create supplier

**Reports Routes** (`GET|POST /api/v1/reports/*`)

- GET /reports/daily → daily summary
- POST /reports/close-day → close business day

### C. Validation Schemas

Use `express-validator` for all request validation:

- Required fields
- Data types
- Email format
- Phone format
- Date ranges
- Enum values

### D. Error Handling

Standard response format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    /* validation errors */
  }
}
```

HTTP Status Codes:

- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 500 Internal Server Error

---

## Priority Order (Recommended)

**Week 1 (Days 1-5)**

1. Create User model
2. Implement auth middleware
3. Implement auth routes (login, refresh, logout)
4. Test auth flow

**Week 2 (Days 6-10)** 5. Create remaining models (Category, MenuItem, Table, Order, etc.) 6. Set up all model associations 7. Create seeders

**Week 3 (Days 11-15)** 8. Implement routes for: Users, Menu, Tables 9. Add validation schemas 10. Test with Postman

**Week 4+ (Days 16+)** 11. Implement routes for: Orders, Bills, Payments, Receipts 12. Implement routes for: Rooms, Bookings, Inventory, Suppliers, Reports 13. Full system testing

---

## Success Criteria

- ✅ All 19 Sequelize models defined
- ✅ All associations working correctly
- ✅ Authentication flow complete (login → token refresh → logout)
- ✅ All 13 API modules have route handlers
- ✅ Input validation on all endpoints
- ✅ Error handling on all endpoints
- ✅ Audit logging for all write operations
- ✅ RBAC enforced on protected routes
- ✅ All endpoints tested and working
- ✅ Sample data seeded

---

## Next Action

**Ready to start PHASE 2?**

Choose one option:

1. **Start with Authentication** (recommended first priority)
   - Implement User model
   - Implement auth routes
   - This unblocks everything else

2. **Create All Models First**
   - Define all 19 models
   - Set up associations
   - Then implement routes

3. **Full Deep-Dive**
   - I'll implement everything in sequence
   - Ready for full PHASE 2 development

**Which approach do you prefer?**
