const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema({
  TRY: Number,
  USD: Number,
  EUR: Number,
  GBP: Number,
  expiryDate: {
    type: Date,
  },
});

const PriceConv = mongoose.model("PriceConv", priceSchema);

module.exports = PriceConv;
