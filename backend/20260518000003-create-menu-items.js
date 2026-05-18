"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("menu_items", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      category_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "categories", key: "id" },
        onDelete: "CASCADE",
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
      price: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      },
      happy_hour_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      happy_hour_start: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      happy_hour_end: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      unit: {
        type: Sequelize.ENUM("piece", "kg", "g", "pack", "bottle", "litre"),
        defaultValue: "piece",
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      module: {
        allowNull: false,
        type: Sequelize.ENUM("restaurant", "bar", "butcher", "grocery"),
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
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex("menu_items", ["category_id"]);
    await queryInterface.addIndex("menu_items", ["module"]);
    await queryInterface.addIndex("menu_items", ["is_available"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("menu_items");
  },
};
