const Transaction = require("../models/Transaction");
const User = require("../models/UserModel");
const bcrypt = require("bcrypt");

// @desc Send money
// @route POST /api/transaction/send
// @access Private
const sendMoney = async (req, res) => {
  try {
    const { receivedUpiId, amount, mpin } = req.body;
    const senderId = req.user._id;

    // Validate input
    if (!mpin) {
      return res.status(400).json({ message: "MPIN is required" });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    // Check MPIN exists in DB
    if (!sender.mpin) {
      return res.status(400).json({
        message: "MPIN not set. Please setup MPIN first",
      });
    }

    // Compare MPIN
    const isMpinMatch = await bcrypt.compare(
      mpin.toString(),
      sender.mpin
    );

    if (!isMpinMatch) {
      return res.status(401).json({ message: "Invalid MPIN" });
    }

    const receiver = await User.findOne({ upiId: receivedUpiId });
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Transfer
    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    await Transaction.create({
      sender: sender._id,
      receiver: receiver._id,
      amount,
      type: "TRANSFER",
      status: "COMPLETED",
    });

    res.json({ message: "Money sent successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Transaction history
const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).populate("sender receiver", "name email phone");

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMoney, getTransactionHistory };
