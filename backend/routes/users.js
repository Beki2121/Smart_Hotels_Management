const router = require("express").Router();
const { User, AuditLog } = require("../db");
const authenticate = require("../middleware/auth");
const { checkRole } = require("../middleware/rbac");
const bcrypt = require("bcryptjs");

// GET /api/v1/users - List all users (super admin only)
router.get(
  "/",
  authenticate,
  checkRole("superadmin"),
  async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: {
          exclude: ["password_hash", "pin_hash", "refresh_token_hash"],
        },
        where: { deleted_at: null },
      });
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// POST /api/v1/users - Create user (super admin only)
router.post("/", authenticate, checkRole("superadmin"), async (req, res) => {
  try {
    const { name, email, pin, password, role, language_pref } = req.body;
    if (!name || !role)
      return res.status(400).json({ error: "Name and role required" });

    const user = await User.create({
      name,
      email,
      pin_hash: pin ? await bcrypt.hash(String(pin), 10) : null,
      password_hash: password ? await bcrypt.hash(password, 10) : null,
      role,
      language_pref,
      is_active: true,
    });

    await AuditLog.create({
      user_id: req.user.userId,
      action: "CREATE",
      entity: "User",
      entity_id: user.id,
      ip_address: req.ip,
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/users/:id - Get user by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: {
        exclude: ["password_hash", "pin_hash", "refresh_token_hash"],
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/v1/users/:id - Update user
router.patch("/:id", authenticate, async (req, res) => {
  try {
    const isAdmin = ["superadmin", "manager"].includes(req.user.role);
    const isSelf = req.user.userId === parseInt(req.params.id);

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { name, email, pin, password, language_pref, is_active } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (language_pref) user.language_pref = language_pref;
    if (isAdmin && typeof is_active !== "undefined") user.is_active = is_active;
    if (pin) user.pin_hash = await bcrypt.hash(String(pin), 10);
    if (password) user.password_hash = await bcrypt.hash(password, 10);

    await user.save();

    await AuditLog.create({
      user_id: req.user.userId,
      action: "UPDATE",
      entity: "User",
      entity_id: user.id,
      ip_address: req.ip,
    });

    res.json({ message: "User updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/v1/users/:id - Soft delete user (super admin only)
router.delete(
  "/:id",
  authenticate,
  checkRole("superadmin"),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      user.deleted_at = new Date();
      await user.save();

      await AuditLog.create({
        user_id: req.user.userId,
        action: "DELETE",
        entity: "User",
        entity_id: user.id,
        ip_address: req.ip,
      });

      res.json({ message: "User deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;
