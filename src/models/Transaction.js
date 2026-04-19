const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    billerName: {
      type: String, 
    },
    type: {
      type: String, 
      enum: ["TRANSFER", "ADD_MONEY", "BILL_PAYMENT", "WITHDRAWAL"],
      required: true,
    },
    status: {
      type: String, 
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING", 
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);