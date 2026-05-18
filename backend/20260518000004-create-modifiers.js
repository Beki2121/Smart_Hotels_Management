"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("modifiers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      menu_item_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "menu_items", key: "id" },
        onDelete: "CASCADE",
      },
      name_en: {
        allowNull: false,
        type: Sequelize.STRING(100),
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      },
      name_am: {
        type: Sequelize.STRING(100),
        allowNull: true,
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      },
      price_delta: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
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

    await queryInterface.addIndex("modifiers", ["menu_item_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("modifiers");
  },
};
