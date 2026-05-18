"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("daily_summaries", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      date: {
        allowNull: false,
        type: Sequelize.DATE,
        unique: true,
      },
      total_revenue: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
      },
      total_orders: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      cash_total: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
      },
      telebirr_total: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
      },
      cbe_total: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
      },
      revenue_restaurant: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
      },
      revenue_bar: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
      },
      revenue_butcher: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
      },
      revenue_grocery: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
      },
      revenue_rooms: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
      },
      physical_cash_count: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      cash_variance: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      closed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
      },
      closed_at: {
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("daily_summaries");
  },
};
