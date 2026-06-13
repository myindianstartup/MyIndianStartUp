export const notFound = (req, res) => {
  res.status(404).json({ error: 'Route not found' });
};

export const errorHandler = (error, req, res, next) => {
  const status = error.status || 500;
  const message = status === 500 ? 'Internal server error' : error.message;

  if (process.env.NODE_ENV !== 'production') {
    console.error(error);
  }

  res.status(status).json({ error: message });
};
