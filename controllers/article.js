const Article = require('../models/Article')
const Category = require('../models/Category')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const User = require('../models/User')

// @desc      Get articles
// @route     GET /api/v1/article
const getAllArticles = async (req, res) => {
  const articles = await Article.find().sort('createdAt')
  res.status(StatusCodes.OK).json({ articles, count: articles.length })
}

// @desc      Get single article
// @route     GET /api/v1/article/:slug
const getArticle = async (req, res) => {
  const slug = req.params.slug
  const article = await Article.findOne({ slug })
  if (!article) {
    throw new CustomError.NotFoundError(`Article ${slug} not found`)
  }
  res.status(StatusCodes.OK).json({
    status: 'success',
    article,
  })
}

// @desc      Create article
// @route     POST /api/v1/article
const createArticle = async (req, res) => {
  let category = await Category.findById(req.body.category)
  let user = await User.findById(req.body.user)
  if (!category) {
    throw new CustomError.NotFoundError(`Category not found`)
  }
  if (!user) {
    throw new CustomError.NotFoundError(`User not found`)
  }
  const article = await Article.create(req.body)
  user = await User.findByIdAndUpdate(
    req.body.user,
    {
      $push: { articles: article._id },
    },
    { new: true }
  )
  category = await Category.findByIdAndUpdate(
    req.body.category,
    {
      $push: { articles: article._id },
    },
    { new: true }
  )

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    article,
  })
}

// @desc      Update all article atrributes at once
// @route     PUT /api/v1/article/:slug
const updateArticle = async (req, res) => {
  const article = await Article.findOneAndUpdate(
    { slug: req.params.slug },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )
  if (!article) {
    throw new CustomError.NotFoundError(`Article ${req.params.slug} not found`)
  }

  res.status(StatusCodes.OK).json({ article })
}

// @desc      Update single article atrribute
// @route     PATCH /api/v1/article/:slug
const updateArticleSingleAtribute = async (req, res) => {
  const { title, body, categories } = req.body

  const article = await Article.findOneAndUpdate(
    { slug: req.params.slug },
    { title, body, categories },
    {
      new: true,
      runValidators: true,
    }
  )
  if (!article) {
    throw new CustomError.NotFoundError(`Article ${req.params.slug} not found`)
  }

  title && res.status(StatusCodes.OK).json({ title })

  body && res.status(StatusCodes.OK).json({ body })

  categories && res.status(StatusCodes.OK).json({ categories })
}

// @desc      Delete article
// @route     DELETE /api/v1/article/:slug
const deleteArticle = async (req, res) => {
  const slug = req.params.slug
  const article = await Article.findOneAndDelete({ slug })
  if (!article) {
    throw new CustomError.NotFoundError(`No Article ${slug}`)
  }
  res.status(StatusCodes.NO_CONTENT).send()
}

// @desc      Delete all Articles
// @route     DELETE /api/v1/Article
const deleteAllArticles = async (req, res) => {
  await Article.deleteMany({})
  res.status(StatusCodes.NO_CONTENT).send()
}

module.exports = {
  createArticle,
  deleteArticle,
  getAllArticles,
  updateArticle,
  updateArticleSingleAtribute,
  getArticle,
  deleteAllArticles,
}
