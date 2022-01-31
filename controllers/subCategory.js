const SubCategory = require('../models/SubCategory')
const Category = require('../models/Category')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')

// @desc      Get sub categories
// @route     GET /api/v1/sub-category
const getAllSubCategories = async (req, res) => {
  const subCategories = await SubCategory.find().populate('articles')
  res.status(StatusCodes.OK).json({
    status: 'success',
    subCategories,
    count: subCategories.length,
  })
}

// @desc      Get single sub category
// @route     GET /api/v1/sub-category/:slug
const getSingleSubCategory = async (req, res) => {
  const slug = req.params.slug
  const subCategory = await SubCategory.findOne({ slug })
  if (!subCategory) {
    throw new CustomError.NotFoundError(`Category ${slug} not found`)
  }
  res.status(StatusCodes.OK).json({
    status: 'success',
    subCategory,
  })
}

// @desc      Post sub category
// @route     POST /api/v1/sub-category
const createSubCategory = async (req, res) => {
  const subCategory = await SubCategory.create({ ...req.body })
  const category = await Category.findByIdAndUpdate(
    req.body.parentCategory,
    {
      $push: { subCategories: subCategory._id },
    },
    { new: true }
  )
  res.status(StatusCodes.CREATED).json({
    status: 'success',
    subCategory: {
      name: subCategory.name,
      parentCategory: category.name,
    },
  })
}

// @desc      Post category
// @route     PUT /api/v1/sub-category/:slug
const updateSubCategory = async (req, res) => {
  const subCategory = await SubCategory.findOneAndUpdate(
    { slug: req.params.slug },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )
  if (!subCategory) {
    throw new CustomError.NotFoundError(`Category ${req.params.slug} not found`)
  }
  res.status(StatusCodes.OK).json({
    status: 'success',
    subCategory,
  })
}

// @desc      Get articles by subCategory
// @route     GET /api/v1/subCategory/:slug/articles
const getArticlesBySubCategory = async (req, res) => {
  const slug = req.params.slug
  const subCategory = await SubCategory.findOne({ slug }).populate('articles', [
    'title',
    'body',
    'user',
  ])
  if (!subCategory) {
    throw new CustomError.NotFoundError(`SubCategory ${slug} not found`)
  }
  res.status(StatusCodes.OK).json({
    status: 'success',
    subCategory: subCategory.name,
    articles: subCategory.articles,
    count: subCategory.articles.length,
  })
}

// @desc      Post category
// @route     DELETE /api/v1/sub-category/:slug
const deleteSubCategory = async (req, res) => {
  const slug = req.params.slug
  const subCategory = await SubCategory.findOneAndDelete({
    slug,
  })
  if (!subCategory) {
    throw new CustomError.NotFoundError(`Sub category ${slug} not found`)
  }
  res.status(StatusCodes.NO_CONTENT).send()
}

// @desc      Delete all categories
// @route     DELETE /api/v1/sub-category
const deleteAllSubCategories = async (req, res) => {
  await Category.deleteMany({})
  res.status(StatusCodes.NO_CONTENT).send()
}

module.exports = {
  getAllSubCategories,
  getSingleSubCategory,
  getArticlesBySubCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  deleteAllSubCategories,
}
