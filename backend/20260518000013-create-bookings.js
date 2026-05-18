"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("bookings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      room_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "rooms", key: "id" },
        onDelete: "RESTRICT",
      },
      guest_name: {
        allowNull: false,
        type: Sequelize.STRING(150),
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      },
      guest_phone: {
        allowNull: false,
        type: Sequelize.STRING(20),
      },
      check_in: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      check_out: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      rate_per_night: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(
          "confirmed",
          "checked_in",
          "checked_out",
          "cancelled",
        ),
        defaultValue: "confirmed",
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

    await queryInterface.addIndex("bookings", ["room_id"]);
    await queryInterface.addIndex("bookings", ["status"]);
    await queryInterface.addIndex("bookings", ["check_in"]);
    await queryInterface.addIndex("bookings", ["check_out"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("bookings");
  },
};
