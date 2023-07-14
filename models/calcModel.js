const mongoose = require("mongoose");

const packagePropSchema = new mongoose.Schema({
  type: {
    type: Number,
    required: [true, "type is required"],
    enum: {
      values: [1, 2],
      message: "please enter 1 for documents and 2 for parcel",
    },
  },
  height: {
    type: Number,
  },
  width: {
    type: Number,
  },
  length: {
    type: Number,
  },
  weight: {
    type: Number,
    required: [true, "weight is required"],
  },
});

const calcSchema = new mongoose.Schema(
  {
    countryCode: {
      type: String,
      minLength: [2, "country code should be at least 2 characters"],
      maxLength: [2, "country code should be at most 2 characters"],
      required: [true, "country code is required"],
    },
    // currency: {
    //   type: String,
    //   minLength: [3, "currency code should be at least 2 characters"],
    //   maxLength: [3, "currency code should be at most 2 characters"],
    //   default: "EUR",
    // },
    packageProp: [packagePropSchema],
    tradeType: {
      type: Number,
      required: [true, "Trade Type is required"],
      enum: {
        values: [1, 2],
        message: "Please Enter 1 for export and 2 for import",
      },
    },
    carrierCompany: String,
    lowestPrice: Number,
  },
  {
    timestamps: true,
  }
);

const CargoCalc = mongoose.model("CargoCalcs", calcSchema);

module.exports = CargoCalc;
