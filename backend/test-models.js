#!/usr/bin/env node

// Quick test to verify models and database connection
require("dotenv").config();

async function test() {
  try {
    console.log("🔍 Testing database connection...");

    const db = require("./db");

    // Test database connection
    await db.sequelize.authenticate();
    console.log("✅ Database connected successfully!");

    // List all models
    const models = Object.keys(db).filter(
      (key) => key !== "sequelize" && key !== "Sequelize",
    );
    console.log(`\n✅ Loaded ${models.length} models:`);
    models.forEach((model) => console.log(`   • ${model}`));

    // Test model attributes
    console.log("\n✅ Model attributes:");
    console.log(
      `   User fields: ${Object.keys(db.User.attributes).join(", ")}`,
    );
    console.log(
      `   Order fields: ${Object.keys(db.Order.attributes).join(", ")}`,
    );
    console.log(
      `   Bill fields: ${Object.keys(db.Bill.attributes).join(", ")}`,
    );

    console.log("\n✅ All models loaded correctly!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

test();
