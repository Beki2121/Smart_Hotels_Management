"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("inventory_items", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name_en: {
        allowNull: false,
        type: Sequelize.STRING(150),
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      },
      name_am: {
        type: Sequelize.STRING(150),
        allowNull: true,
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      },
      module: {
        allowNull: false,
        type: Sequelize.ENUM("restaurant", "bar", "butcher", "grocery"),
      },
      unit: {
        allowNull: false,
        type: Sequelize.STRING(50),
      },
      current_stock: {
        type: Sequelize.DECIMAL(10, 3),
        defaultValue: 0,
      },
      min_threshold: {
        type: Sequelize.DECIMAL(10, 3),
        defaultValue: 0,
      },
      cost_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        ),
      },
    });

    await queryInterface.addIndex("inventory_items", ["module"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("inventory_items");
  },
};
