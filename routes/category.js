const express = require('express')
const router = express.Router()

const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  deleteAllCategories,
  getSubCategoriesByCategory,
  getSingleCategory,
} = require('../controllers/category')

router
  .route('/')
  .get(getAllCategories)
  .post(createCategory)
  .delete(deleteAllCategories)
router
  .route('/:slug')
  .get(getSingleCategory)
  .put(updateCategory)
  .delete(deleteCategory)
router.route('/:slug/sub-categories').get(getSubCategoriesByCategory)

module.exports = router
