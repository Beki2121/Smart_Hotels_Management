// Backend Seeder - Initialize Demo Data
const db = require("./db");
const bcrypt = require("bcryptjs");

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // ============================================================================
    // SEED USERS
    // ============================================================================
    console.log("📝 Seeding users...");
    const superadminPassword = await bcrypt.hash("Admin@123", 10);
    const userPassword = await bcrypt.hash("user123", 10);
    const pinHash = await bcrypt.hash("1234", 10);

    const users = await db.User.bulkCreate([
      {
        name: "Admin",
        email: "admin@smarthms.com",
        password_hash: superadminPassword,
        pin_hash: pinHash,
        role: "superadmin",
        is_active: true,
      },
      {
        name: "Manager One",
        email: "manager@smarthms.com",
        password_hash: userPassword,
        pin_hash: pinHash,
        role: "manager",
        is_active: true,
      },
      {
        name: "Waiter John",
        email: "waiter@smarthms.com",
        password_hash: userPassword,
        pin_hash: pinHash,
        role: "waiter",
        is_active: true,
      },
      {
        name: "Cashier Sarah",
        email: "cashier@smarthms.com",
        password_hash: userPassword,
        pin_hash: pinHash,
        role: "cashier",
        is_active: true,
      },
      {
        name: "Kitchen Chef",
        email: "kitchen@smarthms.com",
        password_hash: userPassword,
        pin_hash: pinHash,
        role: "kitchen",
        is_active: true,
      },
      {
        name: "Receptionist Alex",
        email: "receptionist@smarthms.com",
        password_hash: userPassword,
        pin_hash: pinHash,
        role: "receptionist",
        is_active: true,
      },
    ]);

    console.log(`✅ Created ${users.length} users`);

    // ============================================================================
    // SEED CATEGORIES
    // ============================================================================
    console.log("📝 Seeding categories...");
    const categories = await db.Category.bulkCreate([
      { name: "Beverages", description: "Hot and cold drinks" },
      { name: "Appetizers", description: "Starters and snacks" },
      { name: "Main Courses", description: "Lunch and dinner entrees" },
      { name: "Desserts", description: "Sweet treats" },
      { name: "Breakfast", description: "Breakfast items" },
    ]);

    console.log(`✅ Created ${categories.length} categories`);

    // ============================================================================
    // SEED MENU ITEMS
    // ============================================================================
    console.log("📝 Seeding menu items...");
    const menuItems = await db.MenuItem.bulkCreate([
      {
        category_id: categories[0].id,
        name: "Coffee",
        description: "Hot arabica coffee",
        base_price: 45.0,
        preparation_time_minutes: 5,
      },
      {
        category_id: categories[0].id,
        name: "Fresh Orange Juice",
        description: "Freshly squeezed orange juice",
        base_price: 60.0,
        preparation_time_minutes: 3,
      },
      {
        category_id: categories[1].id,
        name: "Samosa",
        description: "Crispy pastry with vegetables",
        base_price: 30.0,
        preparation_time_minutes: 10,
      },
      {
        category_id: categories[2].id,
        name: "Doro Wat",
        description: "Spiced chicken stew with injera",
        base_price: 120.0,
        preparation_time_minutes: 25,
        is_vegetarian: false,
      },
      {
        category_id: categories[2].id,
        name: "Misir Wat",
        description: "Red lentil stew",
        base_price: 90.0,
        preparation_time_minutes: 20,
        is_vegetarian: true,
      },
      {
        category_id: categories[3].id,
        name: "Cake",
        description: "Chocolate cake slice",
        base_price: 50.0,
        preparation_time_minutes: 2,
      },
      {
        category_id: categories[4].id,
        name: "Scrambled Eggs",
        description: "Eggs with toast",
        base_price: 75.0,
        preparation_time_minutes: 8,
      },
    ]);

    console.log(`✅ Created ${menuItems.length} menu items`);

    // ============================================================================
    // SEED TABLES
    // ============================================================================
    console.log("📝 Seeding restaurant tables...");
    const tables = await db.Table.bulkCreate([
      {
        table_number: "T1",
        capacity: 2,
        section: "Window",
        status: "available",
      },
      {
        table_number: "T2",
        capacity: 2,
        section: "Window",
        status: "available",
      },
      {
        table_number: "T3",
        capacity: 4,
        section: "Middle",
        status: "available",
      },
      {
        table_number: "T4",
        capacity: 4,
        section: "Middle",
        status: "available",
      },
      {
        table_number: "T5",
        capacity: 6,
        section: "Corner",
        status: "available",
      },
      { table_number: "T6", capacity: 2, section: "Bar", status: "available" },
    ]);

    console.log(`✅ Created ${tables.length} tables`);

    // ============================================================================
    // SEED ROOM TYPES
    // ============================================================================
    console.log("📝 Seeding room types...");
    const roomTypes = await db.RoomType.bulkCreate([
      {
        name: "Single Room",
        base_price: 500.0,
        capacity: 1,
        description: "Comfortable single bed room",
      },
      {
        name: "Double Room",
        base_price: 800.0,
        capacity: 2,
        description: "Double bed with modern amenities",
      },
      {
        name: "Suite",
        base_price: 1500.0,
        capacity: 2,
        description: "Luxury suite with living area",
      },
      {
        name: "Family Room",
        base_price: 1200.0,
        capacity: 4,
        description: "Large family room with multiple beds",
      },
    ]);

    console.log(`✅ Created ${roomTypes.length} room types`);

    // ============================================================================
    // SEED ROOMS
    // ============================================================================
    console.log("📝 Seeding rooms...");
    const rooms = await db.Room.bulkCreate([
      {
        room_number: "101",
        room_type_id: roomTypes[0].id,
        floor: 1,
        status: "available",
      },
      {
        room_number: "102",
        room_type_id: roomTypes[1].id,
        floor: 1,
        status: "available",
      },
      {
        room_number: "103",
        room_type_id: roomTypes[1].id,
        floor: 1,
        status: "available",
      },
      {
        room_number: "201",
        room_type_id: roomTypes[2].id,
        floor: 2,
        status: "available",
      },
      {
        room_number: "202",
        room_type_id: roomTypes[3].id,
        floor: 2,
        status: "available",
      },
      {
        room_number: "301",
        room_type_id: roomTypes[0].id,
        floor: 3,
        status: "available",
      },
      {
        room_number: "302",
        room_type_id: roomTypes[1].id,
        floor: 3,
        status: "available",
      },
    ]);

    console.log(`✅ Created ${rooms.length} rooms`);

    // ============================================================================
    // SEED SUPPLIERS
    // ============================================================================
    console.log("📝 Seeding suppliers...");
    const suppliers = await db.Supplier.bulkCreate([
      {
        name: "Local Produce Supply",
        contact_person: "Abebe",
        phone: "+251911123456",
        email: "contact@localfarm.et",
        address: "Addis Ababa, Ethiopia",
        payment_terms: "Net 30",
      },
      {
        name: "Central Meat Market",
        contact_person: "Kebede",
        phone: "+251922654321",
        email: "meat@central.et",
        address: "Addis Ababa, Ethiopia",
        payment_terms: "Cash on Delivery",
      },
      {
        name: "Beverage Distribution",
        contact_person: "Amara",
        phone: "+251933789012",
        email: "supply@beverages.et",
        address: "Addis Ababa, Ethiopia",
        payment_terms: "Net 15",
      },
    ]);

    console.log(`✅ Created ${suppliers.length} suppliers`);

    // ============================================================================
    // SEED INVENTORY ITEMS
    // ============================================================================
    console.log("📝 Seeding inventory items...");
    const inventoryItems = await db.InventoryItem.bulkCreate([
      {
        name: "Tomatoes",
        unit: "kg",
        quantity_on_hand: 50,
        reorder_level: 20,
        unit_cost: 25.0,
        supplier_id: suppliers[0].id,
      },
      {
        name: "Chicken",
        unit: "kg",
        quantity_on_hand: 30,
        reorder_level: 15,
        unit_cost: 150.0,
        supplier_id: suppliers[1].id,
      },
      {
        name: "Coffee Beans",
        unit: "kg",
        quantity_on_hand: 10,
        reorder_level: 5,
        unit_cost: 200.0,
        supplier_id: suppliers[2].id,
      },
      {
        name: "Onions",
        unit: "kg",
        quantity_on_hand: 40,
        reorder_level: 20,
        unit_cost: 20.0,
        supplier_id: suppliers[0].id,
      },
      {
        name: "Oil",
        unit: "liters",
        quantity_on_hand: 5,
        reorder_level: 2,
        unit_cost: 400.0,
        supplier_id: suppliers[0].id,
      },
    ]);

    console.log(`✅ Created ${inventoryItems.length} inventory items`);

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\n📋 Created Data Summary:");
    console.log(
      `  • ${users.length} users (Super Admin: Admin/Admin@123, Others: user123, PIN: 1234)`,
    );
    console.log(`  • ${categories.length} categories`);
    console.log(`  • ${menuItems.length} menu items`);
    console.log(`  • ${tables.length} restaurant tables`);
    console.log(`  • ${roomTypes.length} room types`);
    console.log(`  • ${rooms.length} rooms`);
    console.log(`  • ${suppliers.length} suppliers`);
    console.log(`  • ${inventoryItems.length} inventory items`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

module.exports = seedDatabase;
