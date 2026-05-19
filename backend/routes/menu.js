const router = require("express").Router();
const { Category, MenuItem, Modifier, AuditLog } = require("../db");
const authenticate = require("../middleware/auth");
const { checkRole } = require("../middleware/rbac");

// ============================================================================
// CATEGORY ROUTES
// ============================================================================

// GET /api/v1/categories - List all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [["name_en", "ASC"]],
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/categories - Create category (admin/manager)
router.post(
  "/categories",
  authenticate,
  checkRole("superadmin", "manager"),
  async (req, res) => {
    try {
      const { name_en, name_am, module_type } = req.body;
      if (!name_en || !module_type)
        return res.status(400).json({ error: "Category name_en and module_type required" });

      const category = await Category.create({ name_en, name_am, module_type });

      await AuditLog.create({
        user_id: req.user.userId,
        action: "CREATE",
        entity: "Category",
        entity_id: category.id,
        ip_address: req.ip,
      });

      res.status(201).json(category);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// ============================================================================
// MENUITEM ROUTES
// ============================================================================

// GET /api/v1/menu-items - List all menu items with filters
router.get("/", async (req, res) => {
  try {
    const { category_id, module, search } = req.query;
    const where = { deleted_at: null };
    if (category_id) where.category_id = category_id;
    if (module) where.module = module.toLowerCase();

    const items = await MenuItem.findAll({
      where,
      include: [{ model: Category }, { model: Modifier }],
      order: [["name_en", "ASC"]],
    });

    let results = items;
    if (search) {
      results = items.filter((item) =>
        item.name_en.toLowerCase().includes(search.toLowerCase()),
      );
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/menu-items - Create menu item (admin/manager)
router.post(
  "/",
  authenticate,
  checkRole("superadmin", "manager"),
  async (req, res) => {
    try {
      const {
        category_id,
        name_en,
        name_am,
        price,
        module,
        unit,
      } = req.body;

      if (!category_id || !name_en || price === undefined || !module) {
        return res.status(400).json({
          error: "category_id, name_en, price, and module required",
        });
      }

      const item = await MenuItem.create({
        category_id,
        name_en,
        name_am,
        price,
        module,
        unit: unit || "piece",
      });

      await AuditLog.create({
        user_id: req.user.userId,
        action: "CREATE",
        entity: "MenuItem",
        entity_id: item.id,
        ip_address: req.ip,
      });

      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// GET /api/v1/menu-items/:id - Get single menu item
router.get("/:id", async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id, {
      include: [{ model: Modifier }],
    });
    if (!item) return res.status(404).json({ error: "Menu item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/v1/menu-items/:id - Update menu item
router.patch(
  "/:id",
  authenticate,
  checkRole("superadmin", "manager"),
  async (req, res) => {
    try {
      const item = await MenuItem.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: "Menu item not found" });

      const {
        name_en,
        name_am,
        price,
        unit,
        module,
        is_available,
      } = req.body;

      if (name_en) item.name_en = name_en;
      if (name_am !== undefined) item.name_am = name_am;
      if (price) item.price = price;
      if (unit) item.unit = unit;
      if (module) item.module = module;
      if (typeof is_available !== "undefined") item.is_available = is_available;

      await item.save();

      await AuditLog.create({
        user_id: req.user.userId,
        action: "UPDATE",
        entity: "MenuItem",
        entity_id: item.id,
        ip_address: req.ip,
      });

      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// DELETE /api/v1/menu-items/:id - Soft delete menu item
router.delete(
  "/:id",
  authenticate,
  checkRole("superadmin", "manager"),
  async (req, res) => {
    try {
      const item = await MenuItem.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: "Menu item not found" });

      item.deleted_at = new Date();
      await item.save();

      await AuditLog.create({
        user_id: req.user.userId,
        action: "DELETE",
        entity: "MenuItem",
        entity_id: item.id,
        ip_address: req.ip,
      });

      res.json({ message: "Menu item deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// POST /api/v1/menu-items/:id/modifiers - Add modifier
router.post(
  "/:id/modifiers",
  authenticate,
  checkRole("superadmin", "manager"),
  async (req, res) => {
    try {
      const { name_en, name_am, price_delta } = req.body;
      if (!name_en)
        return res.status(400).json({ error: "Modifier name_en required" });

      const modifier = await Modifier.create({
        menu_item_id: req.params.id,
        name_en,
        name_am,
        price_delta: price_delta || 0,
      });

      res.status(201).json(modifier);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;
