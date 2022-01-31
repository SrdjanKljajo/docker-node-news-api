const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const Article = require('../models/Article')
const { checkPermissions } = require('../utils')
const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
const { uploadFile, getFileStream } = require('../s3')

// @desc      Get all users
// @route     GET /api/v1/user
// @access    Private
const getAllUsers = async (req, res) => {
  const users = await User.find({}).select('-password').populate('articles')
  res.status(StatusCodes.OK).json({
    status: 'success',
    users,
    count: users.length,
  })
}

// @desc      Get single user
// @route     GET /api/v1/user/:slug
// @access    Private
const getUser = async (req, res) => {
  const slug = req.params.slug
  const user = await User.findOne({ slug }).populate('articles')

  if (!user) throw new CustomError.NotFoundError(`User ${slug} not found`)

  res.status(StatusCodes.OK).json({
    status: 'success',
    user,
  })
}

// @desc      Get single user
// @route     GET /api/v1/user/:slug/picture
// @access    Private (only admin and current user)
const getUserPicture = async (req, res) => {
  const slug = req.params.slug
  const user = await User.findOne({ slug })
  if (!user) throw new CustomError.NotFoundError(`User ${slug} not found`)

  const readStream = getFileStream(user.picture)
  readStream.pipe(res)
}

// @desc      Create user
// @route     POST /api/v1/user
// @access    Private (only admin and moderator role)
const createUser = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body
  const image = req.file

  if (password !== confirmPassword) {
    throw new CustomError.BadRequestError('Passwords dont match')
  }

  // apply filter
  // resize

  const img = await uploadFile(image)
  await unlinkFile(image.path)
  let picture = req.body
  picture = img.Key

  const user = await User.create({
    username,
    password,
    email,
    picture,
  })
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

// @desc      Update single user atrribute
// @route     PATCH /api/v1/user/:slug/picture
// @access    Private
const updateUserImage = async (req, res) => {
  const image = req.file
  const img = await uploadFile(image)
  await unlinkFile(image.path)
  let picture = req.body
  picture = img.Key
  const user = await User.findOneAndUpdate(
    { slug: req.params.slug },
    { picture },
    {
      new: true,
      runValidators: true,
    }
  )

  if (!user) throw new CustomError.NotFoundError(`User ${slug} not found`)

  res.status(StatusCodes.OK).json({
    status: 'success',
    msg: `User ${user.username} profile picture is updated`,
  })
}

// @desc      Update user
// @route     PUT /api/v1/user/:slug
// @access    Private
const updateUser = async (req, res) => {
  const { username, password, confirmPassword } = req.body
  const slug = req.params.slug

  if (password !== confirmPassword) {
    throw new CustomError.BadRequestError('Passwords dont match')
  }

  const user = await User.findOneAndUpdate(
    { slug },
    { username, password, confirmPassword },
    {
      new: true,
      runValidators: true,
    }
  )
  if (!user) throw new CustomError.NotFoundError(`User ${slug} not found`)

  res.status(StatusCodes.OK).json({
    status: 'success',
    user,
    msg: `User ${slug} is updated`,
  })
}

// @desc      Get articles by user
// @route     GET /api/v1/user/:slug/articles
const getArticlesByUser = async (req, res) => {
  const slug = req.params.slug
  const user = await User.findOne({ slug }).populate('articles', [
    'title',
    'body',
    'user',
  ])
  if (!user) {
    throw new CustomError.NotFoundError(`User ${slug} not found`)
  }
  res.status(StatusCodes.OK).json({
    status: 'success',
    user: user.name,
    articles: user.articles,
    count: user.articles.length,
  })
}

// @desc      Delete user and user products
// @route     DELETE /api/v1/user/:slug
const deleteUser = async (req, res) => {
  const slug = req.params.slug
  const articlePublisher = await User.findOne({ slug })
  if (!articlePublisher) {
    throw new CustomError.NotFoundError(`User ${slug} not found`)
  }

  checkPermissions(req.user, articlePublisher._id)

  await Article.deleteMany({ user: articlePublisher._id })
  await User.findOneAndDelete({ slug })

  res.status(StatusCodes.NO_CONTENT).send()
}

// @desc      Delete all users
// @route     DELETE /api/v1/user
const deleteAllUsers = async (req, res) => {
  await User.deleteMany({})
  await Article.deleteMany({})
  res.status(StatusCodes.NO_CONTENT).send()
}

module.exports = {
  getAllUsers,
  getUser,
  getUserPicture,
  getArticlesByUser,
  createUser,
  updateUserRole,
  updateUser,
  updateUserImage,
  deleteAllUsers,
  deleteUser,
}
