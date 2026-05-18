"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("bills", {
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
      table_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "tables", key: "id" },
        onDelete: "SET NULL",
      },
      subtotal: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      total_amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      },
      status: {
        type: Sequelize.ENUM("open", "paid", "voided"),
        defaultValue: "open",
      },
      created_by: {
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
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex("bills", ["order_id"]);
    await queryInterface.addIndex("bills", ["status"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("bills");
  },
};
