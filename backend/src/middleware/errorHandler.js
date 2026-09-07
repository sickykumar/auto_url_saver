function errorHandler(err, req, res, next) {
  console.error(`❌ Server Error: ${err.message}`, err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred',
  });
}

module.exports = errorHandler;
