const router = require("express").Router();
const { InventoryItem, StockMovement, Supplier, AuditLog } = require("../db");
const authenticate = require("../middleware/auth");
const { checkRole } = require("../middleware/rbac");

// GET /api/v1/inventory - List inventory items
router.get("/", async (req, res) => {
  try {
    const items = await InventoryItem.findAll({
      include: [{ model: Supplier }],
      order: [["name", "ASC"]],
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/inventory - Create inventory item
router.post(
  "/",
  authenticate,
  checkRole("superadmin", "manager", "butcher", "grocery"),
  async (req, res) => {
    try {
      const { name, unit, reorder_level, unit_cost, supplier_id } = req.body;
      if (!name || !unit || !reorder_level || !unit_cost) {
        return res.status(400).json({
          error: "name, unit, reorder_level, and unit_cost required",
        });
      }

      const item = await InventoryItem.create({
        name,
        unit,
        reorder_level,
        unit_cost,
        supplier_id,
        quantity_on_hand: 0,
      });

      await AuditLog.create({
        user_id: req.user.userId,
        action: "CREATE",
        entity: "InventoryItem",
        entity_id: item.id,
        ip_address: req.ip,
      });

      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// GET /api/v1/inventory/:id - Get inventory item
router.get("/:id", async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id, {
      include: [{ model: StockMovement }],
    });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/v1/inventory/:id - Update inventory item
router.patch(
  "/:id",
  authenticate,
  checkRole("superadmin", "manager", "butcher", "grocery"),
  async (req, res) => {
    try {
      const item = await InventoryItem.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: "Item not found" });

      const { name, unit, reorder_level, unit_cost, supplier_id } = req.body;
      if (name) item.name = name;
      if (unit) item.unit = unit;
      if (reorder_level) item.reorder_level = reorder_level;
      if (unit_cost) item.unit_cost = unit_cost;
      if (supplier_id) item.supplier_id = supplier_id;

      await item.save();

      await AuditLog.create({
        user_id: req.user.userId,
        action: "UPDATE",
        entity: "InventoryItem",
        entity_id: item.id,
        ip_address: req.ip,
      });

      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// POST /api/v1/inventory/:id/movements - Record stock movement
router.post(
  "/:id/movements",
  authenticate,
  checkRole("superadmin", "manager", "butcher", "grocery"),
  async (req, res) => {
    try {
      const { movement_type, quantity, reference_number, notes } = req.body;
      if (!movement_type || !quantity) {
        return res
          .status(400)
          .json({ error: "movement_type and quantity required" });
      }

      const item = await InventoryItem.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: "Item not found" });

      // Record movement
      const movement = await StockMovement.create({
        inventory_item_id: req.params.id,
        movement_type,
        quantity,
        reference_number,
        notes,
      });

      // Update quantity on hand
      let newQuantity = parseFloat(item.quantity_on_hand);
      if (movement_type === "purchase" || movement_type === "return") {
        newQuantity += parseFloat(quantity);
      } else if (movement_type === "consumption") {
        newQuantity -= parseFloat(quantity);
      }

      item.quantity_on_hand = newQuantity;
      await item.save();

      await AuditLog.create({
        user_id: req.user.userId,
        action: "CREATE",
        entity: "StockMovement",
        entity_id: movement.id,
        ip_address: req.ip,
      });

      res.status(201).json(movement);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;
