const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const Article = require('../models/Article')
const { checkPermissions } = require('../utils')

// @desc      Get all users
// @route     GET /api/v1/user
const getAllUsers = async (req, res) => {
  const users = await User.find({}).select('-password').populate('articles')
  res.status(StatusCodes.OK).json({
    status: 'success',
    users,
    count: users.length,
  })
}

// @desc      Get single user
// @route     GET /api/v1/users/:slug
// @access    Private (only admin and current user)
const getUser = async (req, res) => {
  const slug = req.params.slug
  const user = await User.findOne({ slug }).populate('articles')

  if (!user) throw new CustomError.NotFoundError(`User ${slug} not found`)

  //checkPermissions(req.user, user._id)

  res.status(StatusCodes.OK).json({
    status: 'success',
    user,
  })
}

// @desc      Create user
// @route     POST /api/v1/user
// @access    Private (only admin and moderator role)
const createUser = async (req, res) => {
  const { username, email, password, picture, confirmPassword } = req.body

  if (password !== confirmPassword)
    throw new CustomApiError.BadRequestError('Passwords dont match')

  const user = await User.create({ username, password, email, picture })
  res.status(StatusCodes.CREATED).json({
    status: 'success',
    msg: `User ${username} add`,
    user,
  })
}

// @desc      Update single user atrribute
// @route     PATCH /api/v1/users/:slug
// @access    Private (only admin role)
const updateUserRole = async (req, res) => {
  const user = await User.findOneAndUpdate(
    { slug: req.params.slug },
    { role: req.body.role },
    {
      new: true,
      runValidators: true,
    }
  )

  if (!user) throw new CustomError.NotFoundError(`User ${slug} not found`)

  res.status(StatusCodes.OK).json({
    status: 'success',
    msg: `User ${user.username} role updated to ${user.role}`,
  })
}

// @desc      Delete user and user products
// @route     DELETE /api/v1/user/:slug
const deleteUser = async (req, res) => {
  const slug = req.params.slug
  const articlePublisher = await User.findOne({ slug })
  await Article.deleteMany({ username: articlePublisher })
  const user = await User.findOneAndDelete({ slug })
  if (!user) {
    throw new CustomError.NotFoundError(`User ${slug} not found`)
  }
  res.status(StatusCodes.NO_CONTENT).send()
}

// @desc      Delete all users
// @route     DELETE /api/v1/user
const deleteAllUsers = async (req, res) => {
  await User.deleteMany({})
  res.status(StatusCodes.NO_CONTENT).send()
}

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUserRole,
  deleteAllUsers,
  deleteUser,
}
