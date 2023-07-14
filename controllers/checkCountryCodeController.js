const axios = require("axios");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catch_async");

exports.checkCountryCode = catchAsync(async (req, res, next) => {
  const { countryCode } = req.body;
  console.log(countryCode);
  try {
    const response = await axios.post(
      `${process.env.URL}isAvailableForCountry`,
      {
        countryCode: countryCode,
      },
      {
        headers: {
          "content-type": "application/json",
          "X-KKCI-Key": process.env.API_KEY,
        },
      }
    );

    const isAvailable = response.data?.data?.available;

    if (!isAvailable) {
      return next(new AppError(res.__("countryCodeError"), 404));
    }

    req.isAvailable = isAvailable;
    next();
  } catch (e) {
    throw new AppError(res.__("generalError"), e.status);
  }
});
