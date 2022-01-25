const express = require('express')
const router = express.Router()

const {
  getAllSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  deleteAllSubCategories,
  getSingleSubCategory,
} = require('../controllers/subCategory')

router
  .route('/')
  .get(getAllSubCategories)
  .post(createSubCategory)
  .delete(deleteAllSubCategories)
router
  .route('/:slug')
  .get(getSingleSubCategory)
  .put(updateSubCategory)
  .delete(deleteSubCategory)

module.exports = router
