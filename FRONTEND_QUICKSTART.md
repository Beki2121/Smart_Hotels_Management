# 🎯 FRONTEND QUICK START GUIDE

## ⚡ Get Running in 3 Minutes

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Start Backend (if not running)

```bash
cd ../backend
npm start
```

- Backend runs on `http://localhost:5000`
- API ready at `http://localhost:5000/api/v1`

### Step 3: Start Frontend

```bash
cd ../frontend
npm run dev
```

- Frontend runs on `http://localhost:5173`

### Step 4: Open Browser

```
http://localhost:5173
```

---

## 🔐 Demo Credentials

### Admin Access (Full permissions)

```
Email:    admin@smarthms.com
Password: admin123
```

### Manager Access

```
Email:    manager@smarthms.com
Password: manager123
```

### Cashier Access

```
Email:    cashier@smarthms.com
Password: cashier123
```

---

## 📋 What's Available

### Dashboard

- 📊 Total Orders count
- 💰 Total Revenue
- 🏠 Active Bookings
- ⏳ Pending Payments

### Orders

- Create new orders
- Select table
- Add multiple items
- View order status
- Update order status

### Menu

- Browse all items
- View categories
- See prices
- Add new items
- Item availability status

### Bookings

- Create guest bookings
- Select rooms
- Check-in/out dates
- Guest information
- Booking status

### Reports

- Daily revenue summary
- Order statistics
- Top menu items
- Room occupancy rate
- Custom date ranges

---

## 🎨 Pages & Routes

| Page      | URL          | Features              |
| --------- | ------------ | --------------------- |
| Login     | `/login`     | Authentication        |
| Dashboard | `/dashboard` | Main stats & overview |
| Orders    | `/orders`    | Order management      |
| Menu      | `/menu`      | Menu items            |
| Bookings  | `/bookings`  | Room bookings         |
| Reports   | `/reports`   | Analytics             |

---

## 🛠️ Build Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## 📱 Responsive Features

- ✅ Mobile (320px+)
- ✅ Tablet (768px+)
- ✅ Desktop (1024px+)
- ✅ Touch-friendly buttons
- ✅ Flexible layouts

---

## 🔗 API Integration

All pages automatically connect to backend:

```javascript
// Authentication
POST   /auth/login          → Login
POST   /auth/refresh        → Token refresh
POST   /auth/logout         → Logout

// Data fetching
GET    /orders              → Fetch orders
POST   /orders              → Create order
PATCH  /orders/:id/status   → Update status

GET    /menu                → Fetch items
POST   /menu                → Create item

GET    /bookings            → Fetch bookings
POST   /bookings            → Create booking

GET    /reports/daily-summary → Get stats
```

---

## 🎯 Common Tasks

### Create an Order

1. Navigate to Orders page
2. Click "Create Order"
3. Select table
4. Add items
5. Click "Create Order"

### Book a Room

1. Go to Bookings
2. Click "New Booking"
3. Fill guest info
4. Select room
5. Set dates
6. Create booking

### View Reports

1. Go to Reports
2. Select date range
3. View statistics
4. See top items

### Manage Menu

1. Go to Menu
2. Click "Add Item"
3. Fill details
4. Select category
5. Set price
6. Create item

---

## ⚙️ Configuration

### Default Settings

- **Backend:** http://localhost:5000
- **Frontend:** http://localhost:5173
- **Token expiry:** 15 minutes
- **Refresh token:** 30 days

### Environment Variables (if needed)

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=SmartHMS
```

---

## 🐛 Troubleshooting

### "Cannot connect to backend"

- Ensure backend is running on port 5000
- Check network connectivity
- Clear browser cache

### "Login fails"

- Verify email/password combination
- Check backend seeder was run
- Look at browser console for errors

### "Blank pages load"

- Check browser console for errors
- Ensure all npm dependencies installed
- Try clearing cache: `Ctrl+Shift+Delete`

### "Slow loading"

- Check network tab in DevTools
- Ensure backend is responsive
- Consider increasing timeouts

---

## 📚 File Structure

```
frontend/
├── src/
│   ├── useAuthStore.js      ← Authentication state
│   ├── useOrderStore.js     ← Order state
│   ├── apiClient.js         ← API calls
│   ├── App.jsx              ← Main app
│   ├── App.css              ← Main styles
│   ├── index.css            ← Global styles
│   ├── LoginPage.jsx        ← Login
│   ├── DashboardPage.jsx    ← Dashboard
│   ├── OrdersPage.jsx       ← Orders
│   ├── MenuPage.jsx         ← Menu
│   ├── BookingsPage.jsx     ← Bookings
│   ├── ReportsPage.jsx      ← Reports
│   └── main.jsx             ← React entry
├── package.json
├── vite.config.js
└── index.html
```

---

## ✨ Features

### Authentication

- ✅ Login/Logout
- ✅ Token refresh
- ✅ Protected routes
- ✅ Role checking

### User Interface

- ✅ Sidebar navigation
- ✅ Responsive design
- ✅ Status badges
- ✅ Loading states
- ✅ Error messages

### Data Management

- ✅ Create operations
- ✅ Read/list operations
- ✅ Update operations
- ✅ Form validation

### Professional UI

- ✅ Gradient backgrounds
- ✅ Card layouts
- ✅ Smooth animations
- ✅ Professional fonts
- ✅ Color scheme

---

## 🚀 Deployment Ready

Frontend can be deployed to:

- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting

Build and deploy:

```bash
npm run build
# Upload dist/ folder to hosting
```

---

## 📞 Support

For issues or questions:

1. Check browser console (F12)
2. Verify backend is running
3. Check API responses in Network tab
4. Review documentation files

---

## ✅ Checklist Before Going Live

- [x] Backend running and tested
- [x] Database seeded with demo data
- [x] Frontend builds successfully
- [x] Login works with demo credentials
- [x] All pages load correctly
- [x] API calls successful
- [x] No console errors
- [x] Responsive on mobile
- [x] Production environment configured

---

## 🎉 You're All Set!

The SmartHMS system is ready to use:

1. **Backend** → Running and tested ✅
2. **Frontend** → Ready to serve ✅
3. **Database** → Configured and seeded ✅
4. **Users** → Demo data available ✅

Start exploring the system now! 🚀

```
Open http://localhost:5173 in your browser
```

---

**Version:** 1.0.0
**Status:** Production Ready
**Last Updated:** 2024
