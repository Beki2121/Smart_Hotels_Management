const router = require("express").Router();
const { InventoryItem, StockMovement, Supplier, AuditLog } = require("../db");
const authenticate = require("../middleware/auth");
const { checkRole } = require("../middleware/rbac");

// GET /api/v1/inventory - List inventory items
router.get("/", async (req, res) => {
  try {
    const items = await InventoryItem.findAll({
      order: [["name_en", "ASC"]],
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
      const { name_en, name_am, unit, module, min_threshold, cost_price } = req.body;
      if (!name_en || !unit || !module) {
        return res.status(400).json({
          error: "name_en, unit, and module required",
        });
      }

      const item = await InventoryItem.create({
        name_en,
        name_am,
        unit,
        module,
        min_threshold: min_threshold || 0,
        cost_price: cost_price || 0,
        current_stock: 0,
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

      const { name_en, name_am, unit, module, min_threshold, cost_price } = req.body;
      if (name_en) item.name_en = name_en;
      if (name_am !== undefined) item.name_am = name_am;
      if (unit) item.unit = unit;
      if (module) item.module = module;
      if (min_threshold !== undefined) item.min_threshold = min_threshold;
      if (cost_price !== undefined) item.cost_price = cost_price;

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
      let newQuantity = parseFloat(item.current_stock);
      if (movement_type === "purchase" || movement_type === "return") {
        newQuantity += parseFloat(quantity);
      } else if (movement_type === "consumption") {
        newQuantity -= parseFloat(quantity);
      }

      item.current_stock = newQuantity;
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
