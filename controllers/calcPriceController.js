const catchAsync = require("../utils/catch_async");
const AppError = require("../utils/appError");
const axios = require("axios");
const PriceConv = require("../models/priceModel");
const getCurrencies = require("../utils/get_currencies");
const formatPrice = require("../utils/formatPrice");

exports.getCurrencies = catchAsync(async (req, res, next) => {
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

  req.currencies = currencies;

  next();
});

exports.calcPrice = catchAsync(async (req, res, next) => {
  try {
    const response = await axios.post(
      `${process.env.URL}calculatePriceDetailed`,
      { ...req.body, currency: "USD" },
      {
        headers: {
          "content-type": "application/json",
          "X-KKCI-Key": process.env.API_KEY,
        },
      }
    );

    const prices = response.data?.data?.spotPrices;

    // getting the lowest price
    const lowestPriceShippingOption = prices?.sort(
      (a, b) => a.price - b.price
    )[0];

    // check if the avgShipmentDays = 0 so it is not defined
    // getting the lowest duration
    let lowestShipmentDaysOption;
    if (prices[0].avgShipmentDay !== 0) {
      lowestShipmentDaysOption = prices?.sort(
        (a, b) => a.avgShipmentDay - b.avgShipmentDay
      )[0];
    }

    // adding lowest price before the conversion
    req.lowestPrice = lowestPriceShippingOption.price;

    prices.map((el) => {
      formatPrice(req.body.currency, el, req.currencies);
    });

    req.lowestPriceShippingOption = lowestPriceShippingOption;
    req.lowestShipmentDaysOption = lowestShipmentDaysOption;
    req.prices = prices;

    next();
  } catch (e) {
    throw new AppError(res.__("generalError"), e.response.status);
  }
});
