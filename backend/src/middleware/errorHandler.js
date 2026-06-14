export const notFound = (req, res) => {
  res.status(404).json({ error: 'Route not found' });
};

export const errorHandler = (error, req, res, next) => {
  const status = error.status || (error.code === 'LIMIT_FILE_SIZE' ? 413 : error.name === 'ZodError' ? 400 : 500);
  const message = status === 500 ? 'Internal server error' : error.message;

  if (process.env.NODE_ENV !== 'production') {
    console.error(error);
  }

  res.status(status).json({
    error: message,
    ...(error.code ? { code: error.code } : {}),
    ...(error.redirectTo ? { redirectTo: error.redirectTo } : {}),
    ...(error.eligibility ? { eligibility: error.eligibility } : {})
  });
};
