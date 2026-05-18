"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("stock_movements", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      inventory_item_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "inventory_items", key: "id" },
        onDelete: "CASCADE",
      },
      delta: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 3),
      },
      reason: {
        allowNull: false,
        type: Sequelize.STRING(200),
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      },
      reference_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "users", key: "id" },
        onDelete: "RESTRICT",
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

    await queryInterface.addIndex("stock_movements", ["inventory_item_id"]);
    await queryInterface.addIndex("stock_movements", ["created_at"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("stock_movements");
  },
};
