const Category = require('../models/Category')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')

// @desc      Get categories
// @route     GET /api/v1/category
// @access    Private
const getAllCategories = async (req, res) => {
  const categories = await Category.find()
    .populate('articles')
    .populate('subCategories', ['name'])
  res.status(StatusCodes.OK).json({
    status: 'success',
    categories,
    count: categories.length,
  })
}

// @desc      Get single category
// @route     GET /api/v1/category/:slug
const getSingleCategory = async (req, res) => {
  const slug = req.params.slug
  const category = await Category.findOne({ slug })
  if (!category) {
    throw new CustomError.NotFoundError(`Category ${slug} not found`)
  }
  res.status(StatusCodes.OK).json({
    status: 'success',
    category,
  })
}

// @desc      Get sub categories by category
// @route     GET /api/v1/category/:slug/sub-categories
const getSubCategoriesByCategory = async (req, res) => {
  const slug = req.params.slug
  const category = await Category.findOne({ slug }).populate('subCategories', [
    'name',
  ])
  if (!category) {
    throw new CustomError.NotFoundError(`Category ${slug} not found`)
  }
  res.status(StatusCodes.OK).json({
    status: 'success',
    category: category.name,
    subCategories: category.subCategories,
    count: category.subCategories.length,
  })
}

// @desc      Get articles by category
// @route     GET /api/v1/category/:slug/articles
const getArticlesByCategory = async (req, res) => {
  const slug = req.params.slug
  const category = await Category.findOne({ slug }).populate('articles', [
    'title',
    'body',
    'user',
  ])
  if (!category) {
    throw new CustomError.NotFoundError(`Category ${slug} not found`)
  }
  res.status(StatusCodes.OK).json({
    status: 'success',
    category: category.name,
    articles: category.articles,
    count: category.articles.length,
  })
}

// @desc      Post category
// @route     POST /api/v1/category
const createCategory = async (req, res) => {
  const category = await Category.create({ ...req.body })
  res.status(StatusCodes.CREATED).json({
    status: 'success',
    category,
  })
}

// @desc      Post category
// @route     PUT /api/v1/category/:slug
const updateCategory = async (req, res) => {
  const slug = req.params.slug
  const category = await Category.findOneAndUpdate({ slug }, req.body, {
    new: true,
    runValidators: true,
  })
  if (!category) {
    throw new CustomError.NotFoundError(`Category ${slug} not found`)
  }
  res.status(StatusCodes.OK).json({
    status: 'success',
    category: { name: category.name, slug: category.slug },
  })
}

// @desc      Post category
// @route     DELETE /api/v1/category/:slug
const deleteCategory = async (req, res) => {
  const categorySlug = req.params.slug
  const category = await Category.findOneAndDelete({
    slug: req.params.slug,
  })
  if (!category) {
    throw new CustomError.NotFoundError(`No category with slug ${categorySlug}`)
  }
  res.status(StatusCodes.NO_CONTENT).send()
}

// @desc      Delete all categories
// @route     DELETE /api/v1/category
const deleteAllCategories = async (req, res) => {
  await Category.deleteMany({})
  res.status(StatusCodes.NO_CONTENT).send()
}

module.exports = {
  getAllCategories,
  getSubCategoriesByCategory,
  getSingleCategory,
  getArticlesByCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  deleteAllCategories,
}
