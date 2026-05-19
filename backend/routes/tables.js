const router = require("express").Router();
const { Table, Order, AuditLog } = require("../db");
const authenticate = require("../middleware/auth");
const { checkRole } = require("../middleware/rbac");

// GET /api/v1/tables - List all tables
router.get("/", async (req, res) => {
  try {
    const tables = await Table.findAll({
      order: [["label", "ASC"]],
    });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/tables - Create table
router.post(
  "/",
  authenticate,
  checkRole("superadmin", "manager"),
  async (req, res) => {
    try {
      const { label, capacity, section } = req.body;
      if (!label || !capacity)
        return res
          .status(400)
          .json({ error: "label and capacity required" });

      const table = await Table.create({ label, capacity, section });

      await AuditLog.create({
        user_id: req.user.userId,
        action: "CREATE",
        entity: "Table",
        entity_id: table.id,
        ip_address: req.ip,
      });

      res.status(201).json(table);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// PATCH /api/v1/tables/:id - Update table status
router.patch(
  "/:id",
  authenticate,
  checkRole("superadmin", "manager", "waiter"),
  async (req, res) => {
    try {
      const table = await Table.findByPk(req.params.id);
      if (!table) return res.status(404).json({ error: "Table not found" });

      const { status } = req.body;
      if (status) table.status = status;

      await table.save();

      await AuditLog.create({
        user_id: req.user.userId,
        action: "UPDATE",
        entity: "Table",
        entity_id: table.id,
        ip_address: req.ip,
      });

      res.json(table);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;
