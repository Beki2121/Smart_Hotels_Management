const router = require("express").Router();
const { Booking, Room, GuestCharge, AuditLog } = require("../db");
const authenticate = require("../middleware/auth");
const { checkRole } = require("../middleware/rbac");

// GET /api/v1/bookings - List bookings
router.get("/", authenticate, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { deleted_at: null },
      include: [{ model: Room }],
      order: [["createdAt", "DESC"]],
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/bookings - Create booking
router.post(
  "/",
  authenticate,
  checkRole("superadmin", "manager", "receptionist"),
  async (req, res) => {
    try {
      const {
        room_id,
        guest_name,
        guest_phone,
        check_in_date,
        check_out_date,
        number_of_guests,
      } = req.body;

      if (!room_id || !guest_name || !check_in_date || !check_out_date) {
        return res.status(400).json({
          error:
            "room_id, guest_name, check_in_date, and check_out_date required",
        });
      }

      const room = await Room.findByPk(room_id);
      if (!room) return res.status(404).json({ error: "Room not found" });

      const booking_number = `BOOK-${Date.now()}`;
      const booking = await Booking.create({
        booking_number,
        room_id,
        guest_name,
        guest_phone,
        check_in_date: new Date(check_in_date),
        check_out_date: new Date(check_out_date),
        number_of_guests,
        status: "confirmed",
        base_room_charge: room.RoomType?.base_price || 0,
        total_charges: room.RoomType?.base_price || 0,
      });

      room.status = "reserved";
      await room.save();

      await AuditLog.create({
        user_id: req.user.userId,
        action: "CREATE",
        entity: "Booking",
        entity_id: booking.id,
        ip_address: req.ip,
      });

      res.status(201).json(booking);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// GET /api/v1/bookings/:id - Get booking
router.get("/:id", authenticate, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Room }, { model: GuestCharge }],
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/v1/bookings/:id/check-in - Check in guest
router.patch(
  "/:id/check-in",
  authenticate,
  checkRole("superadmin", "manager", "receptionist"),
  async (req, res) => {
    try {
      const booking = await Booking.findByPk(req.params.id);
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      booking.status = "checked_in";
      await booking.save();

      const room = await Room.findByPk(booking.room_id);
      room.status = "occupied";
      await room.save();

      res.json(booking);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// PATCH /api/v1/bookings/:id/check-out - Check out guest
router.patch(
  "/:id/check-out",
  authenticate,
  checkRole("superadmin", "manager", "receptionist"),
  async (req, res) => {
    try {
      const booking = await Booking.findByPk(req.params.id);
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      booking.status = "checked_out";
      await booking.save();

      const room = await Room.findByPk(booking.room_id);
      room.status = "available";
      await room.save();

      res.json(booking);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// POST /api/v1/bookings/:id/charges - Add charge to booking
router.post(
  "/:id/charges",
  authenticate,
  checkRole("superadmin", "manager", "receptionist"),
  async (req, res) => {
    try {
      const { charge_type, amount, description } = req.body;
      if (!charge_type || !amount) {
        return res
          .status(400)
          .json({ error: "charge_type and amount required" });
      }

      const booking = await Booking.findByPk(req.params.id);
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      const charge = await GuestCharge.create({
        booking_id: req.params.id,
        charge_type,
        amount,
        description,
      });

      // Update total charges
      const allCharges = await GuestCharge.findAll({
        where: { booking_id: req.params.id },
      });
      const totalCharges = allCharges.reduce(
        (sum, c) => sum + parseFloat(c.amount),
        0,
      );
      booking.total_charges = totalCharges;
      await booking.save();

      res.status(201).json(charge);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;
