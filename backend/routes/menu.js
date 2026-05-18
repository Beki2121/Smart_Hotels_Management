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
      where: { deleted_at: null },
      order: [["name", "ASC"]],
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
      const { name, description } = req.body;
      if (!name)
        return res.status(400).json({ error: "Category name required" });

      const category = await Category.create({ name, description });

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
    const { category_id, search } = req.query;
    const where = { deleted_at: null };
    if (category_id) where.category_id = category_id;

    const items = await MenuItem.findAll({
      where,
      include: [
        { model: Category, as: "Category" },
        { model: Modifier, as: "Modifiers" },
      ],
      order: [["name", "ASC"]],
    });

    let results = items;
    if (search) {
      results = items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()),
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
        name,
        description,
        base_price,
        is_vegetarian,
        preparation_time_minutes,
      } = req.body;

      if (!category_id || !name || base_price === undefined) {
        return res.status(400).json({
          error: "category_id, name, and base_price required",
        });
      }

      const item = await MenuItem.create({
        category_id,
        name,
        description,
        base_price,
        is_vegetarian,
        preparation_time_minutes,
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
      include: [{ model: Modifier, as: "Modifiers" }],
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
        name,
        description,
        base_price,
        discount_percent,
        is_vegetarian,
        preparation_time_minutes,
        is_active,
      } = req.body;

      if (name) item.name = name;
      if (description !== undefined) item.description = description;
      if (base_price) item.base_price = base_price;
      if (discount_percent !== undefined)
        item.discount_percent = discount_percent;
      if (typeof is_vegetarian !== "undefined")
        item.is_vegetarian = is_vegetarian;
      if (preparation_time_minutes)
        item.preparation_time_minutes = preparation_time_minutes;
      if (typeof is_active !== "undefined") item.is_active = is_active;

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
      const { name, price_adjustment } = req.body;
      if (!name)
        return res.status(400).json({ error: "Modifier name required" });

      const modifier = await Modifier.create({
        menu_item_id: req.params.id,
        name,
        price_adjustment: price_adjustment || 0,
      });

      res.status(201).json(modifier);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;
