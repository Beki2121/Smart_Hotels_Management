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
      { name_en: "Beverages", module_type: "restaurant" },
      { name_en: "Appetizers", module_type: "restaurant" },
      { name_en: "Main Courses", module_type: "restaurant" },
      { name_en: "Desserts", module_type: "restaurant" },
      { name_en: "Breakfast", module_type: "restaurant" },
    ]);

    console.log(`✅ Created ${categories.length} categories`);

    // ============================================================================
    // SEED MENU ITEMS
    // ============================================================================
    console.log("📝 Seeding menu items...");
    const menuItems = await db.MenuItem.bulkCreate([
      {
        category_id: categories[0].id,
        name_en: "Coffee",
        price: 45.0,
        module: "restaurant",
      },
      {
        category_id: categories[0].id,
        name_en: "Fresh Orange Juice",
        price: 60.0,
        module: "restaurant",
      },
      {
        category_id: categories[1].id,
        name_en: "Samosa",
        price: 30.0,
        module: "restaurant",
      },
      {
        category_id: categories[2].id,
        name_en: "Doro Wat",
        price: 120.0,
        module: "restaurant",
      },
      {
        category_id: categories[2].id,
        name_en: "Misir Wat",
        price: 90.0,
        module: "restaurant",
      },
      {
        category_id: categories[3].id,
        name_en: "Cake",
        price: 50.0,
        module: "restaurant",
      },
      {
        category_id: categories[4].id,
        name_en: "Scrambled Eggs",
        price: 75.0,
        module: "restaurant",
      },
    ]);

    console.log(`✅ Created ${menuItems.length} menu items`);

    // ============================================================================
    // SEED TABLES
    // ============================================================================
    console.log("📝 Seeding restaurant tables...");
    const tables = await db.Table.bulkCreate([
      {
        label: "T1",
        capacity: 2,
        section: "Window",
        status: "available",
      },
      {
        label: "T2",
        capacity: 2,
        section: "Window",
        status: "available",
      },
      {
        label: "T3",
        capacity: 4,
        section: "Middle",
        status: "available",
      },
      {
        label: "T4",
        capacity: 4,
        section: "Middle",
        status: "available",
      },
      {
        label: "T5",
        capacity: 6,
        section: "Corner",
        status: "available",
      },
      { label: "T6", capacity: 2, section: "Bar", status: "available" },
    ]);

    console.log(`✅ Created ${tables.length} tables`);

    // ============================================================================
    // SEED ROOM TYPES
    // ============================================================================
    console.log("📝 Seeding room types...");
    const roomTypes = await db.RoomType.bulkCreate([
      {
        name: "Single Room",
        base_rate: 500.0,
        max_occupancy: 1,
        description: "Comfortable single bed room",
      },
      {
        name: "Double Room",
        base_rate: 800.0,
        max_occupancy: 2,
        description: "Double bed with modern amenities",
      },
      {
        name: "Suite",
        base_rate: 1500.0,
        max_occupancy: 2,
        description: "Luxury suite with living area",
      },
      {
        name: "Family Room",
        base_rate: 1200.0,
        max_occupancy: 4,
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
        contact_phone: "+251911123456",
        email: "contact@localfarm.et",
        items_supplied: "Vegetables, Fruits, Grains",
        module: "restaurant",
      },
      {
        name: "Central Meat Market",
        contact_phone: "+251922654321",
        email: "meat@central.et",
        items_supplied: "Beef, Chicken, Lamb",
        module: "butcher",
      },
      {
        name: "Beverage Distribution",
        contact_phone: "+251933789012",
        email: "supply@beverages.et",
        items_supplied: "Coffee, Juice, Soft Drinks",
        module: "bar",
      },
    ]);

    console.log(`✅ Created ${suppliers.length} suppliers`);

    // ============================================================================
    // SEED INVENTORY ITEMS
    // ============================================================================
    console.log("📝 Seeding inventory items...");
    const inventoryItems = await db.InventoryItem.bulkCreate([
      {
        name_en: "Tomatoes",
        module: "restaurant",
        unit: "kg",
        current_stock: 50,
        min_threshold: 20,
        cost_price: 25.0,
      },
      {
        name_en: "Chicken",
        module: "butcher",
        unit: "kg",
        current_stock: 30,
        min_threshold: 15,
        cost_price: 150.0,
      },
      {
        name_en: "Coffee Beans",
        module: "restaurant",
        unit: "kg",
        current_stock: 10,
        min_threshold: 5,
        cost_price: 200.0,
      },
      {
        name_en: "Onions",
        module: "restaurant",
        unit: "kg",
        current_stock: 40,
        min_threshold: 20,
        cost_price: 20.0,
      },
      {
        name_en: "Oil",
        module: "restaurant",
        unit: "liters",
        current_stock: 5,
        min_threshold: 2,
        cost_price: 400.0,
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
