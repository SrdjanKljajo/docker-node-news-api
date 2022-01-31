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
  getArticlesByCategory,
} = require('../controllers/category')

const {
  authenticateUser,
  authorizePermissions,
} = require('../middlewares/auth')

router
  .route('/')
  .get(
    //authenticateUser,
    //authorizePermissions('admin', 'moderator'),
    getAllCategories
  )
  .post(authenticateUser, authorizePermissions('admin'), createCategory)
  .delete(authenticateUser, authorizePermissions('admin'), deleteAllCategories)
router
  .route('/:slug')
  .get(
    authenticateUser,
    authorizePermissions('admin', 'moderator'),
    getSingleCategory
  )
  .put(
    authenticateUser,
    authorizePermissions('admin', 'moderator'),
    updateCategory
  )
  .delete(authenticateUser, authorizePermissions('admin'), deleteCategory)
router.route('/:slug/articles').get(getArticlesByCategory)
router.route('/:slug/sub-categories').get(getSubCategoriesByCategory)

module.exports = router
