"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("receipts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      bill_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "bills", key: "id" },
        onDelete: "CASCADE",
      },
      receipt_number: {
        allowNull: false,
        type: Sequelize.STRING(50),
        unique: true,
      },
      language: {
        type: Sequelize.ENUM("en", "am"),
        defaultValue: "en",
      },
      printed_at: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex("receipts", ["bill_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("receipts");
  },
};
