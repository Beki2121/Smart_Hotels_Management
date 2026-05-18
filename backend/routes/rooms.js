const router = require("express").Router();
const { Room, RoomType, Booking, AuditLog } = require("../db");
const authenticate = require("../middleware/auth");
const { checkRole } = require("../middleware/rbac");

// GET /api/v1/rooms - List rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.findAll({
      include: [{ model: RoomType }],
      order: [["room_number", "ASC"]],
    });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/rooms - Create room
router.post(
  "/",
  authenticate,
  checkRole("superadmin", "manager"),
  async (req, res) => {
    try {
      const { room_number, room_type_id, floor } = req.body;
      if (!room_number || !room_type_id) {
        return res
          .status(400)
          .json({ error: "room_number and room_type_id required" });
      }

      const room = await Room.create({
        room_number,
        room_type_id,
        floor,
        status: "available",
      });

      await AuditLog.create({
        user_id: req.user.userId,
        action: "CREATE",
        entity: "Room",
        entity_id: room.id,
        ip_address: req.ip,
      });

      res.status(201).json(room);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// GET /api/v1/rooms/:id - Get room
router.get("/:id", async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id, {
      include: [{ model: RoomType }],
    });
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/v1/rooms/:id - Update room
router.patch(
  "/:id",
  authenticate,
  checkRole("superadmin", "manager", "receptionist"),
  async (req, res) => {
    try {
      const room = await Room.findByPk(req.params.id);
      if (!room) return res.status(404).json({ error: "Room not found" });

      const { status, floor } = req.body;
      if (status) room.status = status;
      if (floor) room.floor = floor;

      await room.save();

      await AuditLog.create({
        user_id: req.user.userId,
        action: "UPDATE",
        entity: "Room",
        entity_id: room.id,
        ip_address: req.ip,
      });

      res.json(room);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;
