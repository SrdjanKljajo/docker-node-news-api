const express = require('express')
const router = express.Router()

const {
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
  deleteAllTags,
} = require('../controllers/tag')

router.route('/').get(getAllTags).post(createTag).delete(deleteAllTags)
router.route('/:slug').put(updateTag).delete(deleteTag)

module.exports = router
