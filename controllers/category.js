const Category = require('../models/Category')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')

// @desc      Get categories
// @route     GET /api/v1/category
const getAllCategories = async (req, res) => {
  const categories = await Category.find().populate('articles')
  res.status(StatusCodes.OK).json({
    status: 'success',
    categories,
    count: categories.length,
  })
}

// @desc      Post category
// @route     POST /api/v1/category
const createCategory = async (req, res) => {
  const category = await Category.create({ ...req.body })
  res.status(StatusCodes.CREATED).json({
    status: 'success',
    category: { name: category.name, slug: category.slug },
  })
}

// @desc      Post category
// @route     PUT /api/v1/category/:slug
const updateCategory = async (req, res) => {
  const category = await Category.findOneAndUpdate(
    { slug: req.params.slug },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )
  if (!category) {
    throw new CustomError.NotFoundError(`Category ${req.params.slug} not found`)
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
  createCategory,
  updateCategory,
  deleteCategory,
  deleteAllCategories,
}
