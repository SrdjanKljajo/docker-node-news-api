const CustomError = require('./custom-api')
const NotFoundError = require('./not-found')
const BadRequestError = require('./bad-request')
const UnauthenticatedError = require('./unauthenticated')
const UnauthorizedError = require('./unauthorized')
module.exports = {
  CustomError,
  NotFoundError,
  BadRequestError,
  UnauthenticatedError,
  UnauthorizedError,
}
