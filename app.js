const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const currencySchedule = require("./utils/currencySchedule");

//security packages
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssMiddleware = require("./middlewares/xss-middleware");

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
        url: "https://cargo-calc.onrender.com",
      },
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(options);

const app = express();

// start schedule
currencySchedule();

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

app.use(helmet());

// Limit Requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 100 request per hour
  message: "Too many requests from this IP, Please try again in an hour",
});

app.use("/api", limiter); // will affect all the routes that start with /api

app.use(express.json({ limit: "10kb" }));

app.use(mongoSanitize());

app.use(xssMiddleware);

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' http://localhost:3000; img-src 'self' data:;"
  );
  next();
});

app.use("/api/v1/cargo", cargoCalcRoute);

// global
app.all("*", (req, res, next) => {
  console.log("Entered here");
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
