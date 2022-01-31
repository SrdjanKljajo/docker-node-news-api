const Tag = require('../models/Tag')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')

// @desc      Get Tags
// @route     GET /api/v1/tag
const getAllTags = async (req, res) => {
  const tags = await Tag.find().populate('articles')
  res.status(StatusCodes.OK).json({
    status: 'success',
    tags,
    count: tags.length,
  })
}

// @desc      Post tag
// @route     POST /api/v1/tag
const createTag = async (req, res) => {
  const tag = await Tag.create({ ...req.body })
  res.status(StatusCodes.CREATED).json({
    status: 'success',
    Tag: { name: tag.name, slug: tag.slug },
  })
}

// @desc      Post tag
// @route     PUT /api/v1/tag/:slug
const updateTag = async (req, res) => {
  const tag = await Tag.findOneAndUpdate({ slug: req.params.slug }, req.body, {
    new: true,
    runValidators: true,
  })
  if (!tag) {
    throw new CustomError.NotFoundError(`Tag ${req.params.slug} not found`)
  }
  res.status(StatusCodes.OK).json({
    status: 'success',
    Tag: { name: tag.name, slug: tag.slug },
  })
}

// @desc      Get articles by tag
// @route     GET /api/v1/tag/:slug/articles
const getArticlesByTag = async (req, res) => {
  const slug = req.params.slug
  const tag = await Tag.findOne({ slug }).populate('articles', [
    'title',
    'body',
    'user',
  ])
  if (!tag) {
    throw new CustomError.NotFoundError(`Tag ${slug} not found`)
  }
  res.status(StatusCodes.OK).json({
    status: 'success',
    tag: tag.name,
    articles: tag.articles,
    count: tag.articles.length,
  })
}

// @desc      Post tag
// @route     DELETE /api/v1/tag/:slug
const deleteTag = async (req, res) => {
  const tagSlug = req.params.slug
  const tag = await Tag.findOneAndDelete({
    slug: req.params.slug,
  })
  if (!tag) {
    throw new CustomError.NotFoundError(`No Tag with slug ${tagSlug}`)
  }
  res.status(StatusCodes.NO_CONTENT).send()
}

// @desc      Delete all tags
// @route     DELETE /api/v1/tag
const deleteAllTags = async (req, res) => {
  await Tag.deleteMany({})
  res.status(StatusCodes.NO_CONTENT).send()
}

module.exports = {
  getAllTags,
  getArticlesByTag,
  createTag,
  updateTag,
  deleteTag,
  deleteAllTags,
}
