const router = require("express").Router();
const { Receipt, Bill, Order, OrderItem, MenuItem, Payment } = require("../db");
const authenticate = require("../middleware/auth");

// GET /api/v1/receipts/:billId - Get receipt
router.get("/:billId", authenticate, async (req, res) => {
  try {
    const receipt = await Receipt.findOne({
      where: { bill_id: req.params.billId },
      include: [
        {
          model: Bill,
          include: [
            {
              model: Order,
              include: [{ model: OrderItem, include: [MenuItem] }],
            },
            { model: Payment },
          ],
        },
      ],
    });

    if (!receipt) return res.status(404).json({ error: "Receipt not found" });
    res.json(receipt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/receipts/:billId - Generate receipt
router.post("/:billId", authenticate, async (req, res) => {
  try {
    const bill = await Bill.findByPk(req.params.billId, {
      include: [
        {
          model: Order,
          include: [{ model: OrderItem, include: [MenuItem] }],
        },
      ],
    });

    if (!bill) return res.status(404).json({ error: "Bill not found" });

    const receipt_number = `RCP-${Date.now()}`;
    const receiptText = generateReceiptText(bill, receipt_number);

    const receipt = await Receipt.create({
      bill_id: req.params.billId,
      receipt_number,
      receipt_text: receiptText,
    });

    res.status(201).json(receipt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/receipts/:billId/print - Mark receipt as printed
router.post("/:billId/print", authenticate, async (req, res) => {
  try {
    const receipt = await Receipt.findOne({
      where: { bill_id: req.params.billId },
    });

    if (!receipt) return res.status(404).json({ error: "Receipt not found" });

    receipt.is_printed = true;
    await receipt.save();

    res.json(receipt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function generateReceiptText(bill, receiptNumber) {
  let text = `\n${"=".repeat(40)}\n`;
  text += `RECEIPT #${receiptNumber}\n`;
  text += `${new Date().toLocaleString()}\n`;
  text += `${"=".repeat(40)}\n`;

  bill.Order.OrderItems.forEach((item) => {
    text += `${item.MenuItem.name}\n`;
    text += `  Qty: ${item.quantity} x ${item.unit_price} = ${
      item.quantity * item.unit_price
    }\n`;
  });

  text += `${"=".repeat(40)}\n`;
  text += `Subtotal: ${bill.subtotal}\n`;
  text += `Tax: ${bill.tax_amount}\n`;
  text += `Discount: -${bill.discount_amount}\n`;
  text += `TOTAL: ${bill.total_amount} ETB\n`;
  text += `${"=".repeat(40)}\n`;
  text += `Thank you!\n`;

  return text;
}

module.exports = router;
