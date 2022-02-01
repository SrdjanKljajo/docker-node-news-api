const Article = require('../models/Article')
const Category = require('../models/Category')
const SubCategory = require('../models/SubCategory')
const Tag = require('../models/Tag')
const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { checkPermissions } = require('../utils')
const requestIp = require('request-ip')
const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
const { uploadFile } = require('../s3')

// @desc      Get articles
// @route     GET /api/v1/article
// @access    Public
const getAllArticles = async (req, res) => {
  const articles = await Article.find().sort('-createdAt')
  res.status(StatusCodes.OK).json({ articles, count: articles.length })
}

// @desc      Get articles
// @route     GET /api/v1/article/top
// @access    Public
const getTopArticles = async (req, res) => {
  const articles = await Article.find({}).sort({ numberOfLikes: -1 }).limit(5)
  res.status(StatusCodes.OK).json({ articles })
}

// @desc      Get single article
// @route     GET /api/v1/article/:slug
// @access    Public
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
// @access    Private
const createArticle = async (req, res) => {
  const { title, body, category, subCategory, tags, user } = req.body
  const artCategory = await Category.findById(category)
  const artUser = await User.findById(user)
  const image = req.file

  if (!artCategory) {
    throw new CustomError.NotFoundError(`Category not found`)
  }

  if (!artUser) {
    throw new CustomError.NotFoundError(`User not found`)
  }

  if (!image) {
    throw new CustomError.NotFoundError(`Please add article picture`)
  }

  const img = await uploadFile(image)
  await unlinkFile(image.path)
  let picture = req.body
  picture = img.Key

  let article = await Article.create({
    title,
    picture,
    body,
    category,
    subCategory,
    tags,
    user,
  })

  await User.findByIdAndUpdate(
    user,
    {
      $push: { articles: article._id },
    },
    { new: true, runValidators: true }
  )

  await Category.findByIdAndUpdate(
    category,
    {
      $push: { articles: article._id },
    },
    { new: true, runValidators: true }
  )

  await SubCategory.findByIdAndUpdate(
    subCategory,
    {
      $push: { articles: article._id },
    },
    { new: true, runValidators: true }
  )

  await article.save(async (err, data) => {
    if (err) {
      throw new CustomError.BadRequestError('Article save error')
    }
    data._id,
      await Article.findByIdAndUpdate(
        { $push: { tags } },
        { new: true, runValidators: true }
      )
  })

  // Add article to article tags
  article.tags.map(async tag => {
    await Tag.findByIdAndUpdate(
      tag,
      {
        $push: { articles: article._id },
      },
      { new: true, runValidators: true }
    )
  })

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    article,
  })
}

// @desc      List related articles
// @route     GET /api/v1/article/:slug/related
// @access    Public
const listRelated = async (req, res) => {
  const slug = req.params.slug
  const article = await Article.findOne({ slug })

  if (!article) {
    throw new CustomError.NotFoundError(`Article ${slug} not found`)
  }

  const related = await Article.find({
    // Related articles by category without found article
    _id: { $ne: article._id },
    category: article.category,
    //subCategory: article.subCategory,
  }).limit(5)

  res.json(related)
}

// @desc      Create new comment
// @route     POST /api/v1/article/:slug/comments
// @access    Public
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
// @desc      Like article
// @route     PATCH /api/v1/article/:slug/like
// @access    Public
const likeArticle = async (req, res) => {
  const slug = req.params.slug
  const clientIp = requestIp.getClientIp(req)
  let article = await Article.findOne({ slug })
  article.numberOfLikes = article.likes.length

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

  await article.save((article.numberOfLikes = article.likes.length))

  res.status(StatusCodes.OK).json({
    status: 'success',
    likes: article.likes,
    numberOfLikes: article.numberOfLikes,
  })
}

// @desc      Unlike article
// @route     PATCH /api/v1/article/:slug/unlike
// @access    Public
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
// @access    Private
const updateArticle = async (req, res) => {
  const slug = req.params.slug
  let article = await Article.findOne({ slug })
  if (!article) {
    throw new CustomError.NotFoundError(`Article ${slug} not found`)
  }

  const { title, body, category, subCategory, tags } = req.body
  const artCategory = await Category.findById(category)

  if (!artCategory) {
    throw new CustomError.NotFoundError(`Category not found`)
  }

  // Remove article from category
  await Category.findByIdAndUpdate(
    article.category,
    {
      $pull: { articles: article._id },
    },
    { new: true }
  )

  // Remove article from sub category
  await SubCategory.findByIdAndUpdate(
    article.subCategory,
    {
      $pull: { articles: article._id },
    },
    { new: true }
  )

  // Remove article from article tags
  article.tags.map(async tag => {
    await Tag.findByIdAndUpdate(
      tag,
      {
        $pull: { articles: article._id },
      },
      { new: true }
    )
  })

  article = await Article.findOneAndUpdate(
    { slug },
    {
      title,
      body,
      category,
      subCategory,
      tags,
    },
    { new: true, runValidators: true }
  )

  // Add article to category
  await Category.findByIdAndUpdate(
    category,
    {
      $push: { articles: article._id },
    },
    { new: true, runValidators: true }
  )

  // Add article to sub category
  await SubCategory.findByIdAndUpdate(
    subCategory,
    {
      $push: { articles: article._id },
    },
    { new: true, runValidators: true }
  )

  // Add article to article tags
  article.tags.map(async tag => {
    await Tag.findByIdAndUpdate(
      tag,
      {
        $push: { articles: article._id },
      },
      { new: true, runValidators: true }
    )
  })

  res.status(StatusCodes.OK).json({
    status: 'success',
    msg: `Article is successfully updated`,
    article,
  })
}

// @desc      Update article picture
// @route     PATCH /api/v1/article/:slug
// @access    Private
const updateArticleImage = async (req, res) => {
  const slug = req.params.slug
  const image = req.file
  const img = await uploadFile(image)
  await unlinkFile(image.path)
  let picture = req.body
  picture = img.Key
  const article = await Article.findOneAndUpdate(
    { slug },
    { picture },
    {
      new: true,
      runValidators: true,
    }
  )

  if (!article) {
    throw new CustomError.NotFoundError(`Article ${slug} not found`)
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    msg: `Article picture is updated`,
    article,
  })
}

// @desc      Delete article
// @route     DELETE /api/v1/article/:slug
// @access    Private
const deleteArticle = async (req, res) => {
  const slug = req.params.slug
  const article = await Article.findOne({ slug })
  if (!article) {
    throw new CustomError.NotFoundError(`Article ${slug} not found`)
  }

  checkPermissions(req.user, article.user._id)

  await Article.findOneAndDelete({ slug })
  res.status(StatusCodes.NO_CONTENT).send()
}

// @desc      Delete all articles
// @route     DELETE /api/v1/article
// @access    Private (only admin role)
const deleteAllArticles = async (req, res) => {
  await Article.deleteMany({})
  res.status(StatusCodes.NO_CONTENT).send()
}

module.exports = {
  createArticle,
  deleteArticle,
  getAllArticles,
  getTopArticles,
  updateArticle,
  updateArticleImage,
  getArticle,
  listRelated,
  deleteAllArticles,
  createArticleComment,
  likeArticle,
  unlikeArticle,
}
