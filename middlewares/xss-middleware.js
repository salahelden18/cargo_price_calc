const sanitizeHtml = require("sanitize-html");
const AppError = require("../utils/appError");

const xssMiddleware = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    const sanitizedBody = sanitizeRequestBody(req.body);
    if (!sanitizedBody) {
      return next(
        new AppError("the request body contains malicious code", 400)
      );
    }
    req.body = sanitizedBody;
  }

  // Sanitize request query parameters
  if (req.query) {
    const sanitizedQuery = sanitizeRequestQuery(req.query);
    if (!sanitizedQuery) {
      return next(
        new AppError("The request query contains malicious code.", 400)
      );
    }
    req.query = sanitizedQuery;
  }

  next();
};

const sanitizeRequestBody = (body) => {
  for (const key in body) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      const value = body[key];
      if (typeof value === "string") {
        const sanitizedValue = sanitizeHtml(value);
        if (sanitizedValue !== value) {
          return null; // Return null if malicious input is detected
        }
        body[key] = sanitizedValue;
      } else if (typeof value === "object") {
        const sanitizedObject = sanitizeRequestBody(value);
        if (sanitizedObject === null) {
          return null; // Return null if malicious input is detected
        }
        body[key] = sanitizedObject;
      }
    }
  }
  return body;
};

const sanitizeRequestQuery = (query) => {
  for (const key in query) {
    if (Object.prototype.hasOwnProperty.call(query, key)) {
      const value = query[key];
      if (typeof value === "string") {
        const sanitizedValue = sanitizeHtml(value);
        if (sanitizedValue !== value) {
          return null; // Return null if malicious input is detected
        }
        query[key] = sanitizedValue;
      }
    }
  }
  return query;
};

module.exports = xssMiddleware;
