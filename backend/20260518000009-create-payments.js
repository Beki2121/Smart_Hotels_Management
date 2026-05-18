"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("payments", {
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
      method: {
        allowNull: false,
        type: Sequelize.ENUM("cash", "telebirr", "cbe_birr"),
      },
      amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      },
      reference_no: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      confirmed_by: {
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

    await queryInterface.addIndex("payments", ["bill_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("payments");
  },
};
