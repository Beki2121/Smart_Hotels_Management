-- Smart HMS Database Schema - TABLES ONLY (No CREATE DATABASE)
-- Use this if database already exists or was created by admin
-- For user: ilinkmth@localhost

USE ilinkmth_smarthms;

-- ============================================================================
-- TABLE: users
-- ============================================================================
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci,
  email VARCHAR(100) UNIQUE NULL CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci,
  pin_hash VARCHAR(255),
  password_hash VARCHAR(255),
  role ENUM('superadmin','manager','cashier','waiter','kitchen','bar','butcher','grocery','receptionist') NOT NULL,
  language_pref ENUM('en','am') DEFAULT 'en',
  refresh_token_hash VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  INDEX idx_role (role),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: categories
-- ============================================================================
CREATE TABLE categories (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name_en VARCHAR(100) NOT NULL CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci,
  name_am VARCHAR(100) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci,
  module_type ENUM('restaurant','bar','butcher','grocery') NOT NULL,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_module (module_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: menu_items
-- ============================================================================
CREATE TABLE menu_items (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name_en VARCHAR(150) NOT NULL CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci,
  name_am VARCHAR(150) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci,
  price DECIMAL(10,2) NOT NULL,
  happy_hour_price DECIMAL(10,2),
  happy_hour_start TIME,
  happy_hour_end TIME,
  unit ENUM('piece','kg','g','pack','bottle','litre') DEFAULT 'piece',
  is_available BOOLEAN DEFAULT true,
  module ENUM('restaurant','bar','butcher','grocery') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  INDEX idx_category (category_id),
  INDEX idx_module (module),
  INDEX idx_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: modifiers
-- ============================================================================
CREATE TABLE modifiers (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  menu_item_id INT NOT NULL,
  name_en VARCHAR(100) NOT NULL CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci,
  name_am VARCHAR(100) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci,
  price_delta DECIMAL(10,2) DEFAULT 0.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
  INDEX idx_menu_item (menu_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: tables
-- ============================================================================
CREATE TABLE tables (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(50) NOT NULL CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci,
  section VARCHAR(100) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci,
  capacity INT DEFAULT 4,
  status ENUM('available','occupied','reserved') DEFAULT 'available',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: orders
-- ============================================================================
CREATE TABLE orders (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  table_id INT,
  user_id INT NOT NULL,
  status ENUM('pending','preparing','ready','served','billed','cancelled') DEFAULT 'pending',
  type ENUM('restaurant','bar','butcher','grocery','room') NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_table (table_id),
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: order_items
-- ============================================================================
CREATE TABLE order_items (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
  weight_kg DECIMAL(8,3),
  unit_price DECIMAL(10,2) NOT NULL,
  modifier_ids JSON,
  status ENUM('pending','preparing','ready') DEFAULT 'pending',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT,
  INDEX idx_order (order_id),
  INDEX idx_menu_item (menu_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: bills
-- ============================================================================
CREATE TABLE bills (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  table_id INT,
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('open','paid','voided') DEFAULT 'open',
  created_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_order (order_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: payments
-- ============================================================================
CREATE TABLE payments (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  bill_id INT NOT NULL,
  method ENUM('cash','telebirr','cbe_birr') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  reference_no VARCHAR(100),
  confirmed_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
  FOREIGN KEY (confirmed_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_bill (bill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: receipts
-- ============================================================================
CREATE TABLE receipts (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  bill_id INT NOT NULL,
  receipt_number VARCHAR(50) NOT NULL UNIQUE,
  language ENUM('en','am') DEFAULT 'en',
  printed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
  INDEX idx_bill (bill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: room_types
-- ============================================================================
CREATE TABLE room_types (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci,
  description TEXT,
  base_rate DECIMAL(10,2) NOT NULL,
  max_occupancy INT DEFAULT 2,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: rooms
-- ============================================================================
CREATE TABLE rooms (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(20) NOT NULL UNIQUE,
  room_type_id INT NOT NULL,
  floor INT DEFAULT 1,
  status ENUM('available','occupied','maintenance') DEFAULT 'available',
  amenities JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE RESTRICT,
  INDEX idx_status (status),
  INDEX idx_room_type (room_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: bookings
-- ============================================================================
CREATE TABLE bookings (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  guest_name VARCHAR(150) NOT NULL CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci,
  guest_phone VARCHAR(20) NOT NULL,
  check_in DATETIME NOT NULL,
  check_out DATETIME NOT NULL,
  rate_per_night DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2),
  status ENUM('confirmed','checked_in','checked_out','cancelled') DEFAULT 'confirmed',
  created_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_room (room_id),
  INDEX idx_status (status),
  INDEX idx_check_in (check_in),
  INDEX idx_check_out (check_out)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: guest_charges
-- ============================================================================
CREATE TABLE guest_charges (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  description VARCHAR(200) NOT NULL CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci,
  amount DECIMAL(10,2) NOT NULL,
  charged_by INT NOT NULL,
  charged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (charged_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: inventory_items
-- ============================================================================
CREATE TABLE inventory_items (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name_en VARCHAR(150) NOT NULL CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci,
  name_am VARCHAR(150) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci,
  module ENUM('restaurant','bar','butcher','grocery') NOT NULL,
  unit VARCHAR(50) NOT NULL,
  current_stock DECIMAL(10,3) DEFAULT 0,
  min_threshold DECIMAL(10,3) DEFAULT 0,
  cost_price DECIMAL(10,2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: stock_movements
-- ============================================================================
CREATE TABLE stock_movements (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  inventory_item_id INT NOT NULL,
  delta DECIMAL(10,3) NOT NULL,
  reason VARCHAR(200) NOT NULL CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci,
  reference_id INT,
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_inventory_item (inventory_item_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: suppliers
-- ============================================================================
CREATE TABLE suppliers (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci,
  contact_phone VARCHAR(20),
  email VARCHAR(100),
  items_supplied TEXT,
  module ENUM('restaurant','bar','butcher','grocery') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: daily_summaries
-- ============================================================================
CREATE TABLE daily_summaries (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  total_orders INT DEFAULT 0,
  cash_total DECIMAL(12,2) DEFAULT 0,
  telebirr_total DECIMAL(12,2) DEFAULT 0,
  cbe_total DECIMAL(12,2) DEFAULT 0,
  revenue_restaurant DECIMAL(12,2) DEFAULT 0,
  revenue_bar DECIMAL(12,2) DEFAULT 0,
  revenue_butcher DECIMAL(12,2) DEFAULT 0,
  revenue_grocery DECIMAL(12,2) DEFAULT 0,
  revenue_rooms DECIMAL(12,2) DEFAULT 0,
  physical_cash_count DECIMAL(12,2),
  cash_variance DECIMAL(12,2),
  closed_by INT,
  closed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (closed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: audit_logs
-- ============================================================================
CREATE TABLE audit_logs (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id INT,
  payload JSON,
  ip_address VARCHAR(45),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_entity (entity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SCHEMA COMPLETE - 19 Tables Created Successfully
-- ============================================================================
