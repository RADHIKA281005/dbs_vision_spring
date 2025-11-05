import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  // If the error is an instance of our ApiError, use its status code and message
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  // For all other errors, send a generic 500 server error
  console.error(err); // Log the error for debugging

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errors: [err.message],
  });
};

export { errorHandler }; 