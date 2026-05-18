// Translation wrapper function
// Currently returns English strings
// To add Amharic later: add an 'am' object with same keys and switch based on user language preference

const translations = {
  en: {
    // Auth
    "login.title": "Smart HMS Login",
    "login.username": "Username",
    "login.password": "Password",
    "login.pin": "PIN",
    "login.submit": "Login",
    "login.toggle_pin": "Use PIN instead",
    "login.toggle_password": "Use Password instead",
    // Navigation
    "nav.pos": "POS & Billing",
    "nav.tables": "Tables",
    "nav.kds": "Kitchen Display",
    "nav.bar": "Bar Display",
    "nav.butcher": "Butcher",
    "nav.grocery": "Grocery",
    "nav.rooms": "Rooms",
    "nav.reports": "Reports",
    "nav.logout": "Logout",
    // Tables
    "table.available": "Available",
    "table.occupied": "Occupied",
    "table.reserved": "Reserved",
    "table.select": "Select Table",
    // Orders
    "order.new": "New Order",
    "order.send": "Send Order",
    "order.status.pending": "Pending",
    "order.status.preparing": "Preparing",
    "order.status.ready": "Ready",
    "order.status.served": "Served",
    // Billing
    "bill.generate": "Generate Bill",
    "bill.subtotal": "Subtotal",
    "bill.discount": "Discount",
    "bill.tax": "Tax",
    "bill.total": "Total",
    "bill.payment_method": "Payment Method",
    "bill.cash": "Cash",
    "bill.telebirr": "Telebirr",
    "bill.cbe": "CBE Birr",
    "bill.reference": "Reference Number",
    "bill.confirm": "Confirm Payment",
    "bill.split": "Split Bill",
    "bill.void": "Void Bill",
    "bill.print": "Print Receipt",
    // Common
    "common.search": "Search...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.add": "Add",
    "common.close": "Close",
    "common.loading": "Loading...",
    "common.no_results": "No results found",
    "common.offline": "No internet connection — please reconnect",
    "common.error": "Something went wrong. Please try again.",
    // Rooms
    "rooms.checkin": "Check In",
    "rooms.checkout": "Check Out",
    "rooms.add_charge": "Add Charge",
    "rooms.guest_name": "Guest Name",
    "rooms.guest_phone": "Guest Phone",
    "rooms.check_in_date": "Check-in Date",
    "rooms.check_out_date": "Check-out Date",
    // Reports
    "reports.daily": "Daily Summary",
    "reports.revenue": "Revenue",
    "reports.close_day": "Close Day",
    "reports.cash_count": "Physical Cash Count",
  },
};

const currentLang = "en"; // Will become dynamic when Amharic is added

export function t(key) {
  return translations[currentLang][key] || key;
}
