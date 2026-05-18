"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("room_types", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(100),
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      base_rate: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      },
      max_occupancy: {
        type: Sequelize.INTEGER,
        defaultValue: 2,
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("room_types");
  },
};
