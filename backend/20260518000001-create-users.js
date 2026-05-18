"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
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
      email: {
        type: Sequelize.STRING(100),
        unique: true,
        allowNull: true,
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      },
      pin_hash: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      role: {
        allowNull: false,
        type: Sequelize.ENUM(
          "superadmin",
          "manager",
          "cashier",
          "waiter",
          "kitchen",
          "bar",
          "butcher",
          "grocery",
          "receptionist",
        ),
      },
      language_pref: {
        type: Sequelize.ENUM("en", "am"),
        defaultValue: "en",
      },
      refresh_token_hash: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  },
};
