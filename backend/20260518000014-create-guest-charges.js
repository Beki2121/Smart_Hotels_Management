"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("guest_charges", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      booking_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "bookings", key: "id" },
        onDelete: "CASCADE",
      },
      description: {
        allowNull: false,
        type: Sequelize.STRING(200),
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      },
      amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      },
      charged_by: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "users", key: "id" },
        onDelete: "RESTRICT",
      },
      charged_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
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

    await queryInterface.addIndex("guest_charges", ["booking_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("guest_charges");
  },
};
