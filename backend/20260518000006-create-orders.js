"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("orders", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      table_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "tables", key: "id" },
        onDelete: "SET NULL",
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "users", key: "id" },
        onDelete: "RESTRICT",
      },
      status: {
        type: Sequelize.ENUM(
          "pending",
          "preparing",
          "ready",
          "served",
          "billed",
          "cancelled",
        ),
        defaultValue: "pending",
      },
      type: {
        allowNull: false,
        type: Sequelize.ENUM("restaurant", "bar", "butcher", "grocery", "room"),
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
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex("orders", ["table_id"]);
    await queryInterface.addIndex("orders", ["user_id"]);
    await queryInterface.addIndex("orders", ["status"]);
    await queryInterface.addIndex("orders", ["type"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("orders");
  },
};
