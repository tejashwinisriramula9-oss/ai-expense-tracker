export const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  // Centralized logging (stack traces in dev)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err)
  } else {
    console.error('Error:', message)
  }

  res.status(status).json({
    message,
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
}

export default errorHandler
