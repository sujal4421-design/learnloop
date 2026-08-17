// src/middleware/errorHandler.js

// Catches any route that doesn't match anything defined — must be
// registered AFTER all real routes, but BEFORE the error handler.
function notFoundHandler(req, res) {
  res.status(404).render('error', {
    statusCode: 404,
    message: "The page you're looking for doesn't exist."
  });
}

// Express recognizes this as error-handling middleware specifically
// because it takes FOUR arguments (err, req, res, next) — that's not
// optional, Express checks the function's argument count.
function globalErrorHandler(err, req, res, next) {
  console.error('Unhandled error:', err);

  const statusCode = err.status || 500;

  // Never leak stack traces or raw error messages to the user in
  // production — that can expose internal details (file paths, SQL
  // fragments, etc.) that are useful to an attacker.
  const message =
    statusCode === 500
      ? 'Something went wrong on our end. Please try again.'
      : err.message;

  res.status(statusCode).render('error', { statusCode, message });
}

module.exports = { notFoundHandler, globalErrorHandler };
