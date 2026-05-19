// All Sequelize Models - Combined File
// This will be split into individual files once directory structure allows

const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize) => {
  // ============================================================================
  // USER MODEL
  // ============================================================================
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: true,
      },
      pin_hash: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM(
          "superadmin",
          "manager",
          "cashier",
          "waiter",
          "kitchen",
          "bar",
          "butcher",
          "grocery",
          "receptionist",
        ),
        allowNull: false,
      },
      language_pref: {
        type: DataTypes.ENUM("en", "am"),
        defaultValue: "en",
      },
      refresh_token_hash: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "users",
      timestamps: true,
      underscored: true,
    },
  );

  User.beforeCreate(async (user) => {
    if (
      user.password_hash &&
      !user.password_hash.startsWith("$2a$") &&
      !user.password_hash.startsWith("$2b$")
    ) {
      user.password_hash = await bcrypt.hash(user.password_hash, 10);
    }
    if (
      user.pin_hash &&
      !user.pin_hash.startsWith("$2a$") &&
      !user.pin_hash.startsWith("$2b$")
    ) {
      user.pin_hash = await bcrypt.hash(String(user.pin_hash), 10);
    }
  });

  User.beforeUpdate(async (user) => {
    if (
      user.changed("password_hash") &&
      !user.password_hash.startsWith("$2a$") &&
      !user.password_hash.startsWith("$2b$")
    ) {
      user.password_hash = await bcrypt.hash(user.password_hash, 10);
    }
    if (
      user.changed("pin_hash") &&
      !user.pin_hash.startsWith("$2a$") &&
      !user.pin_hash.startsWith("$2b$")
    ) {
      user.pin_hash = await bcrypt.hash(String(user.pin_hash), 10);
    }
  });

  // ============================================================================
  // CATEGORY MODEL
  // ============================================================================
  const Category = sequelize.define(
    "Category",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name_en: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      name_am: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      module_type: {
        type: DataTypes.ENUM("restaurant", "bar", "butcher", "grocery"),
        allowNull: false,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "categories",
      timestamps: true,
      underscored: true,
    },
  );

  // ============================================================================
  // MENUITEM MODEL
  // ============================================================================
  const MenuItem = sequelize.define(
    "MenuItem",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "categories", key: "id" },
      },
      name_en: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      name_am: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      happy_hour_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      happy_hour_start: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      happy_hour_end: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      unit: {
        type: DataTypes.ENUM('piece', 'kg', 'g', 'pack', 'bottle', 'litre'),
        defaultValue: 'piece',
      },
      is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      module: {
        type: DataTypes.ENUM('restaurant', 'bar', 'butcher', 'grocery'),
        allowNull: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "menu_items",
      timestamps: true,
      underscored: true,
    },
  );

  // ============================================================================
  // MODIFIER MODEL
  // ============================================================================
  const Modifier = sequelize.define(
    "Modifier",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      menu_item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "menu_items", key: "id" },
      },
      name_en: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      name_am: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      price_delta: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
    },
    {
      tableName: "modifiers",
      timestamps: true,
      underscored: true,
    },
  );

  // ============================================================================
  // TABLE MODEL
  // ============================================================================
  const Table = sequelize.define(
    "Table",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      label: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      section: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      capacity: {
        type: DataTypes.INTEGER,
        defaultValue: 4,
      },
      status: {
        type: DataTypes.ENUM('available', 'occupied', 'reserved'),
        defaultValue: 'available',
      },
    },
    {
      tableName: "tables",
      timestamps: true,
      underscored: true,
    },
  );

  // ============================================================================
  // ORDER MODEL
  // ============================================================================
  const Order = sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      table_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "tables", key: "id" },
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      status: {
        type: DataTypes.ENUM('pending', 'preparing', 'ready', 'served', 'billed', 'cancelled'),
        defaultValue: 'pending',
      },
      type: {
        type: DataTypes.ENUM('restaurant', 'bar', 'butcher', 'grocery', 'room'),
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "orders",
      timestamps: true,
      underscored: true,
    },
  );

  // ============================================================================
  // ORDERITEM MODEL
  // ============================================================================
  const OrderItem = sequelize.define(
    "OrderItem",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "orders", key: "id" },
      },
      menu_item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "menu_items", key: "id" },
      },
      quantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 1,
      },
      weight_kg: {
        type: DataTypes.DECIMAL(8, 3),
        allowNull: true,
      },
      unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      modifier_ids: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'preparing', 'ready'),
        defaultValue: 'pending',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "order_items",
      timestamps: true,
      underscored: true,
    },
  );

  // ============================================================================
  // BILL MODEL
  // ============================================================================
  const Bill = sequelize.define(
    "Bill",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "orders", key: "id" },
      },
      table_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "tables", key: "id" },
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      tax_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('open', 'paid', 'voided'),
        defaultValue: 'open',
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "bills",
      timestamps: true,
      underscored: true,
    },
  );

  // ============================================================================
  // PAYMENT MODEL
  // ============================================================================
  const Payment = sequelize.define(
    "Payment",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      bill_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "bills", key: "id" },
      },
      method: {
        type: DataTypes.ENUM('cash', 'telebirr', 'cbe_birr'),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      reference_no: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      confirmed_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
    },
    {
      tableName: "payments",
      timestamps: true,
      underscored: true,
    },
  );

  // ============================================================================
  // RECEIPT MODEL
  // ============================================================================
  const Receipt = sequelize.define(
    "Receipt",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      bill_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "bills", key: "id" },
      },
      receipt_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      language: {
        type: DataTypes.ENUM('en', 'am'),
        defaultValue: 'en',
      },
      printed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "receipts",
      timestamps: true,
      underscored: true,
    },
  );

  // ============================================================================
  // ROOMTYPE MODEL
  // ============================================================================
  const RoomType = sequelize.define(
    "RoomType",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      base_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      max_occupancy: {
        type: DataTypes.INTEGER,
        defaultValue: 2,
      },
    },
    {
      tableName: "room_types",
      timestamps: true,
      underscored: true,
    },
  );

  // ============================================================================
  // ROOM MODEL
  // ============================================================================
  const Room = sequelize.define(
    "Room",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      room_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      room_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "room_types", key: "id" },
      },
      floor: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      status: {
        type: DataTypes.ENUM('available', 'occupied', 'maintenance'),
        defaultValue: 'available',
      },
      amenities: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "rooms",
      timestamps: true,
      underscored: true,
    },
  );

  // ============================================================================
  // BOOKING MODEL
  // ============================================================================
  const Booking = sequelize.define(
    "Booking",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "rooms", key: "id" },
      },
      guest_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      guest_phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      check_in: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      check_out: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      rate_per_night: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('confirmed', 'checked_in', 'checked_out', 'cancelled'),
        defaultValue: 'confirmed',
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "bookings",
      timestamps: true,
      underscored: true,
    },
  );

  // ============================================================================
  // GUESTCHARGE MODEL
  // ============================================================================
  const GuestCharge = sequelize.define(
    "GuestCharge",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      booking_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "bookings", key: "id" },
      },
      description: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      charged_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      charged_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "guest_charges",
      timestamps: true,
      underscored: true,
    },
  );

  // ============================================================================
  // INVENTORYITEM MODEL
  // ============================================================================
  const InventoryItem = sequelize.define(
    "InventoryItem",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name_en: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      name_am: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      module: {
        type: DataTypes.ENUM('restaurant', 'bar', 'butcher', 'grocery'),
        allowNull: false,
      },
      unit: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      current_stock: {
        type: DataTypes.DECIMAL(10, 3),
        defaultValue: 0,
      },
      min_threshold: {
        type: DataTypes.DECIMAL(10, 3),
        defaultValue: 0,
      },
      cost_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
    },
    {
      tableName: "inventory_items",
      timestamps: true,
      underscored: true,
    },
  );

  // ============================================================================
  // STOCKMOVEMENT MODEL
  // ============================================================================
  const StockMovement = sequelize.define(
    "StockMovement",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      inventory_item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "inventory_items", key: "id" },
      },
      delta: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      reference_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
    },
    {
      tableName: "stock_movements",
      timestamps: true,
      underscored: true,
    },
  );

  // ============================================================================
  // SUPPLIER MODEL
  // ============================================================================
  const Supplier = sequelize.define(
    "Supplier",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      contact_phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      items_supplied: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      module: {
        type: DataTypes.ENUM('restaurant', 'bar', 'butcher', 'grocery'),
        allowNull: false,
      },
    },
    {
      tableName: "suppliers",
      timestamps: true,
      underscored: true,
    },
  );

  // ============================================================================
  // DAILYSUMMARY MODEL
  // ============================================================================
  const DailySummary = sequelize.define(
    "DailySummary",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        unique: true,
      },
      total_revenue: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      total_orders: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      cash_total: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      telebirr_total: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      cbe_total: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      revenue_restaurant: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      revenue_bar: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      revenue_butcher: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      revenue_grocery: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      revenue_rooms: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      physical_cash_count: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      cash_variance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      closed_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      closed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "daily_summaries",
      timestamps: true,
      underscored: true,
    },
  );

  // ============================================================================
  // AUDITLOG MODEL
  // ============================================================================
  const AuditLog = sequelize.define(
    "AuditLog",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      action: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      entity: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      entity_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      payload: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "audit_logs",
      timestamps: false,
    },
  );

  // ============================================================================
  // ASSOCIATIONS
  // ============================================================================
  Category.hasMany(MenuItem, {
    foreignKey: "category_id",
    onDelete: "CASCADE",
  });
  MenuItem.belongsTo(Category, { foreignKey: "category_id" });
  MenuItem.hasMany(Modifier, {
    foreignKey: "menu_item_id",
    onDelete: "CASCADE",
  });
  Modifier.belongsTo(MenuItem, { foreignKey: "menu_item_id" });

  Table.hasMany(Order, { foreignKey: "table_id", onDelete: "CASCADE" });
  Order.belongsTo(Table, { foreignKey: "table_id" });
  User.hasMany(Order, {
    foreignKey: "created_by_user_id",
    as: "createdOrders",
  });
  Order.belongsTo(User, { foreignKey: "created_by_user_id", as: "creator" });
  Order.hasMany(OrderItem, { foreignKey: "order_id", onDelete: "CASCADE" });
  OrderItem.belongsTo(Order, { foreignKey: "order_id" });
  MenuItem.hasMany(OrderItem, { foreignKey: "menu_item_id" });
  OrderItem.belongsTo(MenuItem, { foreignKey: "menu_item_id" });

  Order.hasOne(Bill, { foreignKey: "order_id", onDelete: "CASCADE" });
  Bill.belongsTo(Order, { foreignKey: "order_id" });
  User.hasMany(Bill, {
    foreignKey: "generated_by_user_id",
    as: "generatedBills",
  });
  Bill.belongsTo(User, { foreignKey: "generated_by_user_id", as: "generator" });
  Bill.hasMany(Payment, { foreignKey: "bill_id", onDelete: "CASCADE" });
  Payment.belongsTo(Bill, { foreignKey: "bill_id" });
  Bill.hasOne(Receipt, { foreignKey: "bill_id", onDelete: "CASCADE" });
  Receipt.belongsTo(Bill, { foreignKey: "bill_id" });

  RoomType.hasMany(Room, { foreignKey: "room_type_id" });
  Room.belongsTo(RoomType, { foreignKey: "room_type_id" });
  Room.hasMany(Booking, { foreignKey: "room_id", onDelete: "CASCADE" });
  Booking.belongsTo(Room, { foreignKey: "room_id" });
  Booking.hasMany(GuestCharge, {
    foreignKey: "booking_id",
    onDelete: "CASCADE",
  });
  GuestCharge.belongsTo(Booking, { foreignKey: "booking_id" });

  Supplier.hasMany(InventoryItem, { foreignKey: "supplier_id" });
  InventoryItem.belongsTo(Supplier, { foreignKey: "supplier_id" });
  InventoryItem.hasMany(StockMovement, {
    foreignKey: "inventory_item_id",
    onDelete: "CASCADE",
  });
  StockMovement.belongsTo(InventoryItem, { foreignKey: "inventory_item_id" });

  User.hasMany(AuditLog, { foreignKey: "user_id", as: "auditLogs" });
  AuditLog.belongsTo(User, { foreignKey: "user_id" });

  return {
    User,
    Category,
    MenuItem,
    Modifier,
    Table,
    Order,
    OrderItem,
    Bill,
    Payment,
    Receipt,
    RoomType,
    Room,
    Booking,
    GuestCharge,
    InventoryItem,
    StockMovement,
    Supplier,
    DailySummary,
    AuditLog,
  };
};
