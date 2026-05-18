"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("categories", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
      module_type: {
        allowNull: false,
        type: Sequelize.ENUM("restaurant", "bar", "butcher", "grocery"),
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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
    await queryInterface.dropTable("categories");
  },
};
