const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, AuditLog } = require("../db");
const authenticate = require("../middleware/auth");

// Helper: generate token pair
function generateTokens(user) {
  const payload = { userId: user.id, role: user.role, name: user.name };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });
  return { accessToken, refreshToken };
}

// POST /api/v1/auth/login
// Body: { username, password } OR { username, pin }
router.post("/login", async (req, res) => {
  try {
    const { username, password, pin } = req.body;
    if (!username)
      return res.status(400).json({ error: "Username is required" });

    const user = await User.findOne({
      where: { name: username, is_active: true },
    });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    let valid = false;
    if (pin && user.pin_hash) {
      valid = await bcrypt.compare(String(pin), user.pin_hash);
    } else if (password && user.password_hash) {
      valid = await bcrypt.compare(password, user.password_hash);
    }
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const { accessToken, refreshToken } = generateTokens(user);

    // Store hashed refresh token
    user.refresh_token_hash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    // Log the action
    try {
      await AuditLog.create({
        user_id: user.id,
        action: "LOGIN",
        entity: "User",
        entity_id: user.id,
        ip_address: req.ip,
      });
    } catch (err) {
      console.error("Audit log failed:", err.message);
    }

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        language_pref: user.language_pref,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/auth/refresh
// Body: { refreshToken }
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ error: "Refresh token required" });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.refresh_token_hash) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const valid = await bcrypt.compare(refreshToken, user.refresh_token_hash);
    if (!valid) return res.status(401).json({ error: "Invalid refresh token" });

    const { accessToken, refreshToken: newRefresh } = generateTokens(user);
    user.refresh_token_hash = await bcrypt.hash(newRefresh, 10);
    await user.save();

    res.json({ accessToken, refreshToken: newRefresh });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});

// POST /api/v1/auth/logout
router.post("/logout", authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (user) {
      user.refresh_token_hash = null;
      await user.save();

      // Log the action
      try {
        await AuditLog.create({
          user_id: user.id,
          action: "LOGOUT",
          entity: "User",
          entity_id: user.id,
          ip_address: req.ip,
        });
      } catch (err) {
        console.error("Audit log failed:", err.message);
      }
    }
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
