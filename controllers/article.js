const Article = require('../models/Article')
const Category = require('../models/Category')
const SubCategory = require('../models/SubCategory')
const Tag = require('../models/Tag')
const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { checkPermissions } = require('../utils')
const requestIp = require('request-ip')

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
  let tags = await Tag.findById(req.body.tags)
  let user = await User.findById(req.body.user)

  if (!category) {
    throw new CustomError.NotFoundError(`Category not found`)
  }

  if (!user) {
    throw new CustomError.NotFoundError(`User not found`)
  }

  let article = await Article.create({ ...req.body })
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

  await SubCategory.findByIdAndUpdate(
    req.body.subCategory,
    {
      $push: { articles: article._id },
    },
    { new: true }
  )

  await article.save(async (err, data) => {
    if (err) {
      throw new CustomError.BadRequestError(err)
    }
    data._id,
      await Article.findByIdAndUpdate(
        { $push: { tags } },
        { new: true, runValidators: true }
      )
  })

  tags = await Tag.findByIdAndUpdate(
    req.body.tags,
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

// @desc    Create new comment
// @route   POST /api/v1/article/:slug/comments
const createArticleComment = async (req, res) => {
  const slug = req.params.slug
  const { name, comment } = req.body
  const article = await Article.findOne({ slug })

  if (!article) {
    throw new CustomError.NotFoundError(`Article ${slug} not found`)
  }

  const userComment = { name, comment }
  article.comments.push(userComment)

  await article.save()
  res.status(StatusCodes.CREATED).json({
    message: 'Comment is successfuly added',
    userComment,
  })
}
// @desc    Create new comment
// @route   PATCH /api/v1/article/:slug/like
const likeArticle = async (req, res) => {
  const slug = req.params.slug
  const clientIp = requestIp.getClientIp(req)
  let article = await Article.findOne({ slug })

  if (!article) {
    throw new CustomError.NotFoundError(`Article ${slug} not found`)
  }

  if (new Set(article.likes).size === article.likes.length) {
    article = await Article.findOneAndUpdate(
      { slug },
      { $push: { likes: clientIp } },
      {
        new: true,
      }
    )
  }

  if (new Set(article.likes).size !== article.likes.length) {
    article = await Article.findOneAndUpdate(
      { slug },
      { $pull: { likes: clientIp } },
      {
        new: true,
      }
    )
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    likes: article.likes,
  })
}

// @desc    Create new comment
// @route   PATCH /api/v1/article/:slug/unlike
const unlikeArticle = async (req, res) => {
  const slug = req.params.slug
  const clientIp = requestIp.getClientIp(req)
  let article = await Article.findOne({ slug })

  if (!article) {
    throw new CustomError.NotFoundError(`Article ${slug} not found`)
  }

  if (new Set(article.unlikes).size === article.unlikes.length) {
    article = await Article.findOneAndUpdate(
      { slug },
      { $push: { unlikes: clientIp } },
      {
        new: true,
      }
    )
  }

  if (new Set(article.unlikes).size !== article.unlikes.length) {
    article = await Article.findOneAndUpdate(
      { slug },
      { $pull: { unlikes: clientIp } },
      {
        new: true,
      }
    )
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    unlikes: article.unlikes,
  })
}

// @desc      Update all article atrributes at once
// @route     PUT /api/v1/article/:slug
const updateArticle = async (req, res) => {
  const slug = req.params.slug
  const article = await Article.findOneAndUpdate({ slug }, req.body, {
    new: true,
    runValidators: true,
  })
  if (!article) {
    throw new CustomError.NotFoundError(`Article ${slug} not found`)
  }

  res.status(StatusCodes.OK).json({ article })
}

// @desc      Delete article
// @route     DELETE /api/v1/article/:slug
const deleteArticle = async (req, res) => {
  const slug = req.params.slug
  const article = await Article.findOneAndDelete({ slug })
  if (!article) {
    throw new CustomError.NotFoundError(`Article ${slug} not found`)
  }
  res.status(StatusCodes.NO_CONTENT).send()
}

// @desc      Delete all articles
// @route     DELETE /api/v1/article
const deleteAllArticles = async (req, res) => {
  await Article.deleteMany({})
  res.status(StatusCodes.NO_CONTENT).send()
}

module.exports = {
  createArticle,
  deleteArticle,
  getAllArticles,
  updateArticle,
  getArticle,
  deleteAllArticles,
  createArticleComment,
  likeArticle,
  unlikeArticle,
}
