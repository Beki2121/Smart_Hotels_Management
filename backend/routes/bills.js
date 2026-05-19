const router = require("express").Router();
const {
  Bill,
  Order,
  OrderItem,
  MenuItem,
  Payment,
  AuditLog,
  User,
} = require("../db");
const authenticate = require("../middleware/auth");
const { checkRole } = require("../middleware/rbac");

// GET /api/v1/bills - List bills
router.get("/", authenticate, async (req, res) => {
  try {
    const bills = await Bill.findAll({
      where: { deleted_at: null },
      include: [
        { model: Order },
        { model: User, attributes: ["id", "name"] },
        { model: Payment },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/bills - Generate bill from order
router.post(
  "/",
  authenticate,
  checkRole("superadmin", "manager", "cashier"),
  async (req, res) => {
    try {
      const { order_id, discount_amount = 0, tax_percent = 0 } = req.body;
      if (!order_id)
        return res.status(400).json({ error: "order_id required" });

      const order = await Order.findByPk(order_id, {
        include: [OrderItem],
      });
      if (!order) return res.status(404).json({ error: "Order not found" });

      // Calculate subtotal from order items
      let subtotal = 0;
      if (order.OrderItems) {
        subtotal = order.OrderItems.reduce((sum, item) => {
          return sum + item.price * item.quantity;
        }, 0);
      }

      const taxAmount = (subtotal * tax_percent) / 100;
      const totalAmount = subtotal + taxAmount - discount_amount;

      const bill = await Bill.create({
        order_id,
        created_by: req.user.userId,
        subtotal,
        tax_amount: taxAmount,
        discount_amount,
        total_amount: totalAmount,
        status: "open",
      });

      await AuditLog.create({
        user_id: req.user.userId,
        action: "CREATE",
        entity: "Bill",
        entity_id: bill.id,
        ip_address: req.ip,
      });

      res.status(201).json(bill);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// GET /api/v1/bills/:id - Get bill
router.get("/:id", authenticate, async (req, res) => {
  try {
    const bill = await Bill.findByPk(req.params.id, {
      include: [
        {
          model: Order,
          include: [{ model: OrderItem, include: [MenuItem] }],
        },
        { model: Payment },
      ],
    });
    if (!bill) return res.status(404).json({ error: "Bill not found" });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/v1/bills/:id/finalize - Finalize bill
router.patch(
  "/:id/finalize",
  authenticate,
  checkRole("superadmin", "manager", "cashier"),
  async (req, res) => {
    try {
      const bill = await Bill.findByPk(req.params.id);
      if (!bill) return res.status(404).json({ error: "Bill not found" });

      bill.status = "paid";
      await bill.save();

      await AuditLog.create({
        user_id: req.user.userId,
        action: "UPDATE",
        entity: "Bill",
        entity_id: bill.id,
        ip_address: req.ip,
      });

      res.json(bill);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// POST /api/v1/bills/:id/void - Void bill
router.post(
  "/:id/void",
  authenticate,
  checkRole("superadmin", "manager"),
  async (req, res) => {
    try {
      const bill = await Bill.findByPk(req.params.id);
      if (!bill) return res.status(404).json({ error: "Bill not found" });

      bill.status = "voided";
      bill.deleted_at = new Date();
      await bill.save();

      await AuditLog.create({
        user_id: req.user.userId,
        action: "DELETE",
        entity: "Bill",
        entity_id: bill.id,
        ip_address: req.ip,
      });

      res.json({ message: "Bill voided" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;
