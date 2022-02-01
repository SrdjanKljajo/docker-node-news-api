const express = require('express')
const router = express.Router()

const {
  getAllSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  deleteAllSubCategories,
  getSingleSubCategory,
  getArticlesBySubCategory,
} = require('../controllers/subCategory')

const {
  authenticateUser,
  authorizePermissions,
} = require('../middlewares/auth')

router
  .route('/')
  .get(
    //authenticateUser,
    //authorizePermissions('admin'),
    getAllSubCategories
  )
  .post(authenticateUser, authorizePermissions('admin'), createSubCategory)
  .delete(
    authenticateUser,
    authorizePermissions('admin'),
    deleteAllSubCategories
  )
router
  .route('/:slug')
  .get(authenticateUser, authorizePermissions('admin'), getSingleSubCategory)
  .put(authenticateUser, authorizePermissions('admin'), updateSubCategory)
  .delete(authenticateUser, authorizePermissions('admin'), deleteSubCategory)
router.route('/:slug/articles').get(getArticlesBySubCategory)

module.exports = router
