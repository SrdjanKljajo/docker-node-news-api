const express = require('express')
const router = express.Router()

const {
  getAllArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  updateArticleSingleAtribute,
  deleteAllArticles,
} = require('../controllers/article')

router
  .route('/')
  .get(getAllArticles)
  .post(createArticle)
  .delete(deleteAllArticles)
router.route('/:slug').get(getArticle).delete(deleteArticle)

// Update single atribute
router.route('/:slug').patch(updateArticleSingleAtribute)

// Update All atributes at once
router.route('/:slug').put(updateArticle)

module.exports = router
