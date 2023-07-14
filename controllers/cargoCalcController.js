const Calc = require("../models/calcModel");
const catchAsync = require("../utils/catch_async");
const APIFeatures = require("../utils/api-features");
const PriceConv = require("../models/priceModel");
const getCurrencies = require("../utils/get_currencies");
const formatPrice = require("../utils/formatPrice");

exports.saveInDB = catchAsync(async (req, res, next) => {
  const currentDate = new Date();
  const result = await PriceConv.findOne();
  let currencies;

  // if there is one check its expiry date if finished make new request and store the data in db
  if (result) {
    console.log("there is a result");
    // if currentdate is greater than the expiry date means make new request and update
    console.log(currentDate);
    console.log(result.expiryDate);
    if (result.expiryDate < currentDate) {
      console.log("expiry date is not valid");
      currencies = await getCurrencies();

      result.TRY = currencies.TRY;
      result.USD = currencies.USD;
      result.EUR = currencies.EUR;
      result.GBP = currencies.GBP;
      result.expiryDate = new Date(currentDate.getTime() + 2 * 60 * 60 * 1000);

      await result.save();
    } else {
      console.log("expiry date is valid");

      // expiry date is still valid
      currencies = result;
    }
  } else {
    console.log("no currencies created one");
    // creating new one
    currencies = await getCurrencies();

    // creating new one if no one exist
    const newPrice = new PriceConv({
      TRY: currencies.TRY,
      USD: currencies.USD,
      EUR: currencies.EUR,
      GBP: currencies.GBP,
      expiryDate: new Date(currentDate.getTime() + 2 * 60 * 60 * 1000),
    });

    await newPrice.save();
  }

  await Calc.create({
    ...req.body,
    lowestPrice: req.lowestPriceShippingOption.price * currencies.EUR,
    carrierCompany: req.lowestPriceShippingOption.firmName,
  });

  formatPrice(req.body.currency, req, currencies);

  res.status(200).json({
    status: res.__("success"),
    currency: req.body.currency,
    lowestPrice: req.lowestPriceShippingOption,
    lowestShipmentDays: req.lowestShipmentDaysOption ?? null,
    data: req.prices ?? null,
  });
});

// get the info from the db
exports.getDbInfo = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Calc.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const calcs = await features.query.populate("packageProp");

  res.status(200).json({
    status: res.__("success"),
    results: calcs.length,
    data: calcs,
  });
});
