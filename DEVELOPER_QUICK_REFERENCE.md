# 🚀 SmartHMS - DEVELOPER QUICK REFERENCE

**Keep this handy while developing!**

---

## 🔧 QUICK SETUP (5 minutes)

```bash
# Database (MySQL/MariaDB)
mysql -u root -p < database-mariadb.sql

# Backend
cd backend && npm install && npm run dev
# Runs on http://localhost:3001

# Frontend (new terminal)
cd frontend && npm install && npm run dev
# Runs on http://localhost:5173
```

Open: **http://localhost:5173**  
Login: **admin** / **admin123**

---

## 📁 FILE LOCATIONS

| What            | Where                                   |
| --------------- | --------------------------------------- |
| Login           | `frontend/src/LoginPage.jsx`            |
| Dashboard       | `frontend/src/Pages/AdminDashboard.jsx` |
| POS             | `frontend/src/Pages/POSPage.jsx`        |
| Kitchen         | `frontend/src/Pages/KDSPage.jsx`        |
| API Hooks       | `frontend/src/api/hooks.js`             |
| Fetch Wrapper   | `frontend/src/api/apiClient.js`         |
| Components      | `frontend/src/Components/`              |
| Router          | `frontend/src/App.jsx`                  |
| Auth Store      | `frontend/src/useAuthStore.js`          |
| Backend API     | `backend/routes/`                       |
| Database Models | `backend/models.js`                     |
| Schema          | `database-mariadb.sql`                  |

---

## 🎨 STYLING QUICK REFERENCE

```jsx
// Button
<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

// Card
<Card title="Title" subtitle="Subtitle">
  <p>Content here</p>
</Card>

// Input
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  required
/>

// Modal
<Modal isOpen={isOpen} title="Title" onClose={handleClose}>
  <p>Content</p>
  <Button onClick={handleClose}>Close</Button>
</Modal>

// Alert
<Alert type="success" title="Success!" message="Done!" />
```

---

## 📊 API HOOKS QUICK REFERENCE

```jsx
import { useOrders, useMenuItems, useAuth, useRooms } from './api/hooks';

// Get data (auto-refetch)
const { data: orders, isLoading, error } = useOrders();

// Create/Update/Delete (mutations)
const createOrderMutation = useCreateOrder();
createOrderMutation.mutate({ table_id: 1, items: [...] });

// Get with filters
const { data: items } = useMenuItems({ category_id: 1 });

// Get single record
const { data: order } = useOrder(orderId);
```

---

## 🔐 AUTHENTICATION

```jsx
import useAuthStore from "./useAuthStore";

// In any component:
const { user, token, login, logout } = useAuthStore();

// Check if logged in
if (!user) <Navigate to="/login" />;

// Get user role
const userRole = user?.role; // 'admin', 'waiter', 'kitchen', etc.

// Logout
<button onClick={logout}>Logout</button>;
```

---

## 🛒 CART STATE (POS)

```jsx
import useCartStore from "./useCartStore";

const cart = useCartStore();

// Add item
cart.addItem({ id: 1, name: "Coffee", price: 50, qty: 1 });

// Remove item
cart.removeItem(itemId);

// Update quantity
cart.updateQuantity(itemId, 2);

// Get total
const total = cart.getTotal(); // Returns number

// Clear cart
cart.clearCart();

// Get items
const items = cart.items; // Array of items
```

---

## 🔄 REAL-TIME UPDATES (SOCKET.IO)

```jsx
import useSocketStore from "./useSocketStore";

const socket = useSocketStore();

// Connect (auto on init)
// Already connected via Zustand

// Listen for events
socket.on("order_created", (data) => {
  console.log("New order:", data);
});

// Emit events
socket.emit("order_ready", { order_id: 123 });

// Turn off listener
socket.off("order_created");
```

---

## 🗂️ CREATING A NEW PAGE

```jsx
// 1. Create file: src/Pages/NewPage.jsx
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Button, Table } from "../Components";
import useAuthStore from "../useAuthStore";

export default function NewPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState([]);

  // Fetch data
  const { data: items, isLoading } = useQuery({
    queryKey: ["items"],
    queryFn: () => fetch("/api/v1/items").then((r) => r.json()),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">New Page</h1>

      <Card title="Data">
        <Table
          data={items}
          columns={[
            { key: "name", label: "Name" },
            { key: "price", label: "Price" },
          ]}
        />
      </Card>
    </div>
  );
}

// 2. Add route in App.jsx
<Route
  path="/newpage"
  element={
    <ProtectedRoute>
      <NewPage />
    </ProtectedRoute>
  }
/>;

// 3. Add to Sidebar menu in Components/Sidebar.jsx
```

---

## 🏗️ ADDING A NEW COMPONENT

```jsx
// src/Components/MyComponent.jsx
import React from "react";

export default function MyComponent({
  title,
  children,
  onClick,
  className = "",
}) {
  return (
    <div
      className={`p-4 border rounded bg-white ${className}`}
      onClick={onClick}
    >
      {title && <h3 className="font-bold mb-2">{title}</h3>}
      {children}
    </div>
  );
}

// Export from index.js
// src/Components/index.js - add:
// export { default as MyComponent } from './MyComponent';

// Use anywhere:
import { MyComponent } from "./Components";
<MyComponent title="Hello">Content</MyComponent>;
```

---

## 📝 COMMON PATTERNS

### Protected Route

```jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

### Loading State

```jsx
const { data, isLoading, error } = useQuery({...});

if (isLoading) return <Loading />;
if (error) return <Alert type="error" message={error.message} />;

return <div>{/* render data */}</div>;
```

### Form Submission

```jsx
const [formData, setFormData] = useState({ name: "", email: "" });
const createMutation = useCreateItem();

const handleSubmit = (e) => {
  e.preventDefault();
  createMutation.mutate(formData, {
    onSuccess: () => {
      alert("Created!");
      setFormData({ name: "", email: "" });
    },
    onError: (err) => alert(`Error: ${err.message}`),
  });
};

return (
  <form onSubmit={handleSubmit}>
    <Input
      value={formData.name}
      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    />
    <Button type="submit" disabled={createMutation.isPending}>
      {createMutation.isPending ? "Creating..." : "Create"}
    </Button>
  </form>
);
```

### Modal Pattern

```jsx
const [isOpen, setIsOpen] = useState(false);

return (
  <>
    <Button onClick={() => setIsOpen(true)}>Open</Button>

    <Modal isOpen={isOpen} title="Dialog" onClose={() => setIsOpen(false)}>
      <p>Content</p>
      <Button onClick={() => setIsOpen(false)}>Close</Button>
    </Modal>
  </>
);
```

---

## 🐛 DEBUGGING TIPS

```javascript
// Check user auth
console.log(useAuthStore.getState());

// Check cart state
console.log(useCartStore.getState());

// Check API response
const { data, status } = await fetch("/api/v1/orders").then((r) => r.json());
console.log("Status:", status, "Data:", data);

// Check Socket.io connection
const socket = useSocketStore.getState().socket;
console.log("Connected:", socket?.connected);

// Check React Query cache
import { QueryClient } from "@tanstack/react-query";
console.log(queryClient.getQueryData(["orders"]));
```

---

## 💾 DATABASE QUERIES

```sql
-- Create order
INSERT INTO orders (table_id, user_id, status, total_amount)
VALUES (1, 5, 'pending', 500);

-- Update order status
UPDATE orders SET status = 'completed' WHERE id = 1;

-- Get today's orders
SELECT * FROM orders WHERE DATE(created_at) = CURDATE();

-- Get total revenue
SELECT SUM(total_amount) FROM orders WHERE DATE(created_at) = CURDATE();

-- Get popular items
SELECT menu_items.name, COUNT(*) as count
FROM order_items
JOIN menu_items ON order_items.item_id = menu_items.id
GROUP BY menu_items.id
ORDER BY count DESC;
```

---

## 🔑 ENVIRONMENT VARIABLES

**Frontend (.env.local)**

```
VITE_API_URL=http://localhost:3001/api/v1
VITE_SOCKET_URL=http://localhost:3001
VITE_ENV=development
```

**Backend (.env)**

```
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ilinkmth_smarthms
JWT_SECRET=your_secret_key
NODE_ENV=development
```

---

## 🚀 COMMON COMMANDS

```bash
# Frontend
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Check code quality

# Backend
npm run dev              # Start with nodemon
npm start                # Start normally
npm run seed             # Seed demo data
npm run migrate          # Run migrations

# Database
mysql -u root -p < database-mariadb.sql    # Load schema
mysql -u root -p ilinkmth_smarthms < dump.sql  # Load dump
mysqldump -u root -p ilinkmth_smarthms > backup.sql  # Create backup
```

---

## 🎯 ROLE-BASED ACCESS

```javascript
const roleMenuMap = {
  admin: ["dashboard", "pos", "inventory", "reports"],
  manager: ["dashboard", "reports"],
  waiter: ["tables", "orders"],
  kitchen: ["kds"],
  bar: ["bar-display", "bar-pos"],
  cashier: ["pos", "billing"],
  butcher: ["butcher-pos"],
  grocery: ["grocery-pos"],
  receptionist: ["rooms", "bookings"],
};
```

---

## ✅ TESTING CHECKLIST

```
[ ] Page loads
[ ] User can login
[ ] Navigation works
[ ] Forms validate
[ ] API calls succeed
[ ] Data displays correctly
[ ] Buttons are responsive
[ ] No console errors
[ ] Real-time updates work
[ ] Mobile responsive
```

---

## 📊 9 DEMO ACCOUNTS

| Role         | Username     | Password        |
| ------------ | ------------ | --------------- |
| Admin        | admin        | admin123        |
| Manager      | manager      | manager123      |
| Cashier      | cashier      | cashier123      |
| Waiter       | waiter       | waiter123       |
| Kitchen      | kitchen      | kitchen123      |
| Bar          | bar          | bar123          |
| Butcher      | butcher      | butcher123      |
| Grocery      | grocery      | grocery123      |
| Receptionist | receptionist | receptionist123 |

---

## 📚 DOCUMENTATION

- `README.md` - Main guide
- `FINAL_COMPLETION_REPORT.md` - What's included
- `DEPLOYMENT_CHECKLIST.md` - How to deploy
- `IMPLEMENTATION_COMPLETE.md` - Full details
- `SmartHMS_Codex_Prompt.md` - Original spec

---

## 🆘 QUICK SUPPORT

**Issue**: Frontend won't load  
**Fix**: Check backend is running, clear cache, check .env.local

**Issue**: API calls failing  
**Fix**: Verify backend is running, check network tab, review backend logs

**Issue**: Database error  
**Fix**: Verify MySQL is running, check credentials in .env

**Issue**: Can't login  
**Fix**: Use correct demo credentials, check database has users

---

## 🎉 YOU'RE ALL SET!

Everything works. Just start coding!

```bash
npm run dev  # Both frontend and backend
```

Happy coding! 🚀
