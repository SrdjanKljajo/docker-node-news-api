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
} = require('../controllers/article')

const {
  authenticateUser,
  authorizePermissions,
} = require('../middlewares/auth')

router
  .route('/')
  .get(getAllArticles)
  .post(createArticle)
  .delete(deleteAllArticles)

router.route('/:slug').get(getArticle).delete(deleteArticle).put(updateArticle)

// Add comments to article
router.route('/:slug/comments').post(createArticleComment)

// Add like to article
router.route('/:slug/like').patch(likeArticle)

// Unlike article
router.route('/:slug/unlike').patch(unlikeArticle)

module.exports = router
