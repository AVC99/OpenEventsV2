function privateRoute(req, res, next) {

  if (!req.headers.authorization) return next('401')

  const token = req.headers.authorization.split(" ")[1];

  if (!token) return next('401')

  const jwt = require('jsonwebtoken');

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    req.USER_ID = decoded.id
    req.USER_EMAIL = decoded.email
    next()

  } catch (error) {
    return next('401')
  }
}

module.exports = { privateRoute }