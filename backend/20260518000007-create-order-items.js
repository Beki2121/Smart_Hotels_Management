"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("order_items", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      order_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "orders", key: "id" },
        onDelete: "CASCADE",
      },
      menu_item_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "menu_items", key: "id" },
        onDelete: "RESTRICT",
      },
      quantity: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 3),
        defaultValue: 1,
      },
      weight_kg: {
        type: Sequelize.DECIMAL(8, 3),
        allowNull: true,
      },
      unit_price: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      },
      modifier_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("pending", "preparing", "ready"),
        defaultValue: "pending",
      },
      notes: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex("order_items", ["order_id"]);
    await queryInterface.addIndex("order_items", ["menu_item_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("order_items");
  },
};
