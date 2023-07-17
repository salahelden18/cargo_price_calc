const schedule = require("node-schedule");
const getCurrencies = require("../helpers/getCurrencies");
const PriceConv = require("../models/priceModel");

// 0 */2 * * *
const startSchedule = () => {
  schedule.scheduleJob("0 */2 * * *", async function () {
    try {
      const currencies = await getCurrencies();

      await PriceConv.findOneAndUpdate({}, currencies, {
        new: true,
        upsert: true,
      });
      console.log("Updated Successfully");
    } catch (e) {
      console.log("something went wrong while updating", e);
    }
  });
};

module.exports = startSchedule;
