const express = require('express')
const router = express.Router()

const {
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
  deleteAllTags,
  getArticlesByTag,
  getSingleTag,
} = require('../controllers/tag')

const {
  authenticateUser,
  authorizePermissions,
} = require('../middlewares/auth')

router
  .route('/')
  .get(
    //authenticateUser, authorizePermissions('admin'),
    getAllTags
  )
  .post(authenticateUser, authorizePermissions('admin'), createTag)
  .delete(authenticateUser, authorizePermissions('admin'), deleteAllTags)
router
  .route('/:slug')
  .get(getSingleTag)
  .put(authenticateUser, authorizePermissions('admin'), updateTag)
  .delete(authenticateUser, authorizePermissions('admin'), deleteTag)
router.route('/:slug/articles').get(getArticlesByTag)

module.exports = router
