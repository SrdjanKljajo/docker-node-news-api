const express = require('express')
const router = express.Router()

const {
  getAllArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  deleteAllArticles,
  createArticleComment,
  likeArticle,
  unlikeArticle,
  listRelated,
  getTopArticles,
  updateArticleImage,
} = require('../controllers/article')

const {
  authenticateUser,
  authorizePermissions,
} = require('../middlewares/auth')

const uploadImg = require('../middlewares/imageUpload')

router
  .route('/')
  .get(getAllArticles)
  .post(authenticateUser, uploadImg, createArticle)
  .delete(authenticateUser, authorizePermissions('admin'), deleteAllArticles)

// Get top articles
router.route('/top').get(getTopArticles)

router
  .route('/:slug')
  .get(getArticle)
  .delete(authenticateUser, deleteArticle)
  .put(authenticateUser, updateArticle)
  .patch(authenticateUser, uploadImg, updateArticleImage)

// Add comments to article
router.route('/:slug/comments').post(createArticleComment)

// List related articles
router.route('/:slug/related').get(listRelated)

// Add like to article
router.route('/:slug/like').patch(likeArticle)

// Unlike article
router.route('/:slug/unlike').patch(unlikeArticle)

module.exports = router
