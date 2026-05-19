const router = require("express").Router();
const { Order, OrderItem, MenuItem, Table, AuditLog, User } = require("../db");
const authenticate = require("../middleware/auth");
const { checkRole } = require("../middleware/rbac");

// GET /api/v1/orders - List orders with filters
router.get("/", authenticate, async (req, res) => {
  try {
    const { status, table_id } = req.query;
    const where = { deleted_at: null };
    if (status) where.status = status;
    if (table_id) where.table_id = table_id;

    const orders = await Order.findAll({
      where,
      include: [
        { model: Table },
        { model: User, attributes: ["id", "name"] },
        { model: OrderItem, include: [MenuItem] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/orders - Create order
router.post(
  "/",
  authenticate,
  checkRole("superadmin", "manager", "waiter", "cashier"),
  async (req, res) => {
    try {
      const { table_id, items, special_requests } = req.body;
      if (!table_id)
        return res.status(400).json({ error: "table_id required" });

      const order = await Order.create({
        table_id,
        user_id: req.user.userId,
        status: "pending",
        type: "restaurant",
        notes: special_requests,
      });

      // Add items if provided
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const menuItem = await MenuItem.findByPk(item.menu_item_id);
          if (menuItem) {
            await OrderItem.create({
              order_id: order.id,
              menu_item_id: item.menu_item_id,
              quantity: item.quantity || 1,
              unit_price: menuItem.price,
              modifier_ids: item.modifiers || null,
              notes: item.special_instructions,
            });
          }
        }
      }

      await AuditLog.create({
        user_id: req.user.userId,
        action: "CREATE",
        entity: "Order",
        entity_id: order.id,
        ip_address: req.ip,
      });

      res.status(201).json(order);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// POST /api/v1/orders/:id/items - Add items to order
router.post(
  "/:id/items",
  authenticate,
  checkRole("superadmin", "manager", "waiter"),
  async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) return res.status(404).json({ error: "Order not found" });

      const { items } = req.body;
      if (!items || !Array.isArray(items))
        return res.status(400).json({ error: "items array required" });

      let totalAdded = 0;
      for (const item of items) {
        const menuItem = await MenuItem.findByPk(item.menu_item_id);
        if (menuItem) {
          await OrderItem.create({
            order_id: order.id,
            menu_item_id: item.menu_item_id,
            quantity: item.quantity || 1,
            unit_price: menuItem.price,
            modifier_ids: item.modifiers || null,
            notes: item.special_instructions,
          });
        }
      }

      await AuditLog.create({
        user_id: req.user.userId,
        action: "UPDATE",
        entity: "Order",
        entity_id: order.id,
        ip_address: req.ip,
      });

      res.json(order);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// PATCH /api/v1/orders/:id/status - Update order status
router.patch("/:id/status", authenticate, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "status required" });

    order.status = status;
    await order.save();

    await AuditLog.create({
      user_id: req.user.userId,
      action: "UPDATE",
      entity: "Order",
      entity_id: order.id,
      ip_address: req.ip,
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/v1/orders/:id - Cancel order (soft delete)
router.patch(
  "/:id",
  authenticate,
  checkRole("superadmin", "manager", "cashier"),
  async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) return res.status(404).json({ error: "Order not found" });

      order.deleted_at = new Date();
      order.status = "cancelled";
      await order.save();

      await AuditLog.create({
        user_id: req.user.userId,
        action: "DELETE",
        entity: "Order",
        entity_id: order.id,
        ip_address: req.ip,
      });

      res.json({ message: "Order cancelled" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;
