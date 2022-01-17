const express = require('express')
const router = express.Router()

const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  deleteAllCategories,
} = require('../controllers/category')

router
  .route('/')
  .get(getAllCategories)
  .post(createCategory)
  .delete(deleteAllCategories)
router.route('/:slug').put(updateCategory).delete(deleteCategory)

module.exports = router
