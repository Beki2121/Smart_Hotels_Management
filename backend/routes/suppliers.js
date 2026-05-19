const router = require("express").Router();
const { Supplier, AuditLog } = require("../db");
const authenticate = require("../middleware/auth");
const { checkRole } = require("../middleware/rbac");

// GET /api/v1/suppliers - List suppliers
router.get("/", async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      order: [["name", "ASC"]],
    });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/suppliers - Create supplier
router.post(
  "/",
  authenticate,
  checkRole("superadmin", "manager"),
  async (req, res) => {
    try {
      const { name, contact_phone, email, module, items_supplied } = req.body;
      if (!name)
        return res.status(400).json({ error: "Supplier name required" });

      const supplier = await Supplier.create({
        name,
        contact_phone,
        email,
        module,
        items_supplied,
      });

      await AuditLog.create({
        user_id: req.user.userId,
        action: "CREATE",
        entity: "Supplier",
        entity_id: supplier.id,
        ip_address: req.ip,
      });

      res.status(201).json(supplier);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// GET /api/v1/suppliers/:id - Get supplier
router.get("/:id", async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ error: "Supplier not found" });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/v1/suppliers/:id - Update supplier
router.patch(
  "/:id",
  authenticate,
  checkRole("superadmin", "manager"),
  async (req, res) => {
    try {
      const supplier = await Supplier.findByPk(req.params.id);
      if (!supplier)
        return res.status(404).json({ error: "Supplier not found" });

      const {
        name,
        contact_phone,
        email,
        module,
        items_supplied,
      } = req.body;

      if (name) supplier.name = name;
      if (contact_phone) supplier.contact_phone = contact_phone;
      if (email) supplier.email = email;
      if (module) supplier.module = module;
      if (items_supplied) supplier.items_supplied = items_supplied;

      await supplier.save();

      await AuditLog.create({
        user_id: req.user.userId,
        action: "UPDATE",
        entity: "Supplier",
        entity_id: supplier.id,
        ip_address: req.ip,
      });

      res.json(supplier);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;
