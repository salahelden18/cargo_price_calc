const catchAsync = require("../utils/catch_async");
const AppError = require("../utils/appError");
const axios = require("axios");

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

    req.lowestPriceShippingOption = lowestPriceShippingOption;
    req.lowestShipmentDaysOption = lowestShipmentDaysOption;
    req.prices = prices;

    next();
  } catch (e) {
    throw new AppError(res.__("generalError"), e.response.status);
  }
});
