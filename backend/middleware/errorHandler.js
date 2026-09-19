const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let clientMessage = err.message || 'An unexpected error occurred. Please try again.';

  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);

  // Catch Mongoose CastError or BSON errors (e.g. invalid ObjectId)
  if (err.name === 'CastError' || /Cast to ObjectId|BSONError/i.test(err.message)) {
    statusCode = 400;
    clientMessage = 'Invalid data provided for one or more fields. Please check your selections and try again.';
  }
  // Catch Mongoose Schema Validation errors
  else if (err.name === 'ValidationError' || /validation failed/i.test(err.message)) {
    statusCode = 400;
    if (err.errors) {
      const fieldErrors = Object.values(err.errors)
        .map((e) => e.message)
        .filter((msg) => msg && !/Cast to|BSON|ObjectId/i.test(msg));

      clientMessage = fieldErrors.length > 0
        ? fieldErrors.join('. ')
        : 'Please make sure all required fields are filled out correctly.';
    } else {
      clientMessage = 'Please verify all booking details and required fields.';
    }
  }
  // Catch Duplicate Key Error
  else if (err.code === 11000) {
    statusCode = 400;
    clientMessage = 'A booking or record with these details already exists. Please verify your information.';
  }
  // Mask any 500 or technical/database strings from ever reaching user
  else if (statusCode === 500 || /BSONError|Cast to|ObjectId|Mongoose|MongoError|SyntaxError/i.test(clientMessage)) {
    clientMessage = 'We could not process your request at this moment. Please check your details or contact our team directly.';
  }

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
