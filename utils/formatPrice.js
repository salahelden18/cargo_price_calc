const formatPrice = (currency, req, currencies) => {
  switch (currency) {
    case "EUR":
      req.lowestPriceShippingOption.price *= currencies.EUR;
      break;
    case "TRY":
      req.lowestPriceShippingOption.price *= currencies.TRY;
      break;
    case "USD":
      req.lowestPriceShippingOption.price *= currencies.USD;
      break;
    case "GBP":
      req.lowestPriceShippingOption.price *= currencies.GBP;
      break;
  }
};

module.exports = formatPrice;
