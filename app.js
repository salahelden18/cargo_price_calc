const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");

// importing the routes
const cargoCalcRoute = require("./routes/cargoCalcRoute");

// adding swagger
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

// adding something
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "KargomKolay Cargo Calculator API",
      version: "1.0.0",
      description:
        "Api For Calculating shipment prices from Kargom Kolay Company",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(options);

const app = express();

app.use(cors());

app.options("*", cors());

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

// adding localization
const { I18n } = require("i18n");

const i18n = I18n({
  locales: ["en", "tr", "ar"],
  directory: path.join(__dirname, "translation"),
  defaultLocale: "en",
});

app.use(i18n.init);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());

app.use("/api/v1/cargo", cargoCalcRoute);

// global
app.all("*", (req, res, next) => {
  console.log("Entered here");
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
