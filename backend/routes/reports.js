const router = require("express").Router();
const { DailySummary, Bill, Payment, Booking, AuditLog } = require("../db");
const { Sequelize } = require("sequelize");
const authenticate = require("../middleware/auth");
const { checkRole } = require("../middleware/rbac");

// GET /api/v1/reports/daily - Get daily summary
router.get(
  "/daily",
  authenticate,
  checkRole("superadmin", "manager", "cashier"),
  async (req, res) => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const bills = await Bill.findAll({
        where: { status: "finalized", deleted_at: null },
        include: [{ model: Payment }],
      });

      const payments = bills.flatMap((bill) => bill.Payments);

      const totalSales = bills.reduce(
        (sum, bill) => sum + parseFloat(bill.total_amount || 0),
        0,
      );
      const totalCash = payments
        .filter((p) => p.payment_method === "cash")
        .reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
      const totalTelebirr = payments
        .filter((p) => p.payment_method === "telebirr")
        .reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
      const totalCBE = payments
        .filter((p) => p.payment_method === "cbe_birr")
        .reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);

      const summary = {
        summary_date: today,
        total_sales: totalSales,
        total_cash: totalCash,
        total_telebirr: totalTelebirr,
        total_cbe: totalCBE,
        total_orders: bills.length,
        is_closed: false,
      };

      res.json(summary);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// GET /api/v1/reports/revenue - Get revenue report
router.get(
  "/revenue",
  authenticate,
  checkRole("superadmin", "manager"),
  async (req, res) => {
    try {
      const { from_date, to_date } = req.query;

      const where = { status: "finalized", deleted_at: null };
      if (from_date || to_date) {
        where.createdAt = {};
        if (from_date) where.createdAt[Sequelize.Op.gte] = new Date(from_date);
        if (to_date) where.createdAt[Sequelize.Op.lte] = new Date(to_date);
      }

      const bills = await Bill.findAll({
        where,
        attributes: [
          [Sequelize.fn("DATE", Sequelize.col("createdAt")), "date"],
          [Sequelize.fn("SUM", Sequelize.col("total_amount")), "total"],
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: [Sequelize.fn("DATE", Sequelize.col("createdAt"))],
        order: [[Sequelize.fn("DATE", Sequelize.col("createdAt")), "DESC"]],
      });

      res.json(bills);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// POST /api/v1/reports/close-day - Close business day
router.post(
  "/close-day",
  authenticate,
  checkRole("superadmin", "manager"),
  async (req, res) => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const bills = await Bill.findAll({
        where: { status: "finalized", deleted_at: null },
        include: [{ model: Payment }],
      });

      const payments = bills.flatMap((bill) => bill.Payments);

      const totalSales = bills.reduce(
        (sum, bill) => sum + parseFloat(bill.total_amount || 0),
        0,
      );
      const totalCash = payments
        .filter((p) => p.payment_method === "cash")
        .reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
      const totalTelebirr = payments
        .filter((p) => p.payment_method === "telebirr")
        .reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
      const totalCBE = payments
        .filter((p) => p.payment_method === "cbe_birr")
        .reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);

      const summary = await DailySummary.create({
        summary_date: today,
        total_sales: totalSales,
        total_cash: totalCash,
        total_telebirr: totalTelebirr,
        total_cbe: totalCBE,
        total_orders: bills.length,
        is_closed: true,
      });

      await AuditLog.create({
        user_id: req.user.userId,
        action: "CLOSE_DAY",
        entity: "DailySummary",
        entity_id: summary.id,
        ip_address: req.ip,
      });

      res.status(201).json(summary);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;
