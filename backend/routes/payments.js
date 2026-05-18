const router = require("express").Router();
const { Payment, Bill, AuditLog } = require("../db");
const authenticate = require("../middleware/auth");
const { checkRole } = require("../middleware/rbac");

// GET /api/v1/payments - List payments
router.get("/", authenticate, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [{ model: Bill }],
      order: [["createdAt", "DESC"]],
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/payments - Record payment
router.post(
  "/",
  authenticate,
  checkRole("superadmin", "manager", "cashier"),
  async (req, res) => {
    try {
      const { bill_id, payment_method, amount_paid, reference_number } =
        req.body;
      if (!bill_id || !payment_method || !amount_paid) {
        return res.status(400).json({
          error: "bill_id, payment_method, and amount_paid required",
        });
      }

      const bill = await Bill.findByPk(bill_id);
      if (!bill) return res.status(404).json({ error: "Bill not found" });

      const payment = await Payment.create({
        bill_id,
        payment_method,
        amount_paid,
        reference_number,
        status: "completed",
      });

      // Update bill status if fully paid
      if (parseFloat(amount_paid) >= parseFloat(bill.total_amount)) {
        bill.status = "finalized";
        await bill.save();
      }

      await AuditLog.create({
        user_id: req.user.userId,
        action: "CREATE",
        entity: "Payment",
        entity_id: payment.id,
        ip_address: req.ip,
      });

      res.status(201).json(payment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;
