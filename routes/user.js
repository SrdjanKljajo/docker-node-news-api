const express = require('express')
const router = express.Router()

const {
  getAllUsers,
  deleteAllUsers,
  deleteUser,
  createUser,
  getUser,
  updateUserRole,
  getUserPicture,
  getArticlesByUser,
  updateUser,
  updateUserImage,
} = require('../controllers/user')

const {
  authenticateUser,
  authorizePermissions,
} = require('../middlewares/auth')

const uploadImg = require('../middlewares/imageUpload')

router
  .route('/')
  .get(
    //authenticateUser,
    //authorizePermissions('admin', 'moderator'),
    getAllUsers
  )
  .post(
    authenticateUser,
    authorizePermissions('admin', 'moderator'),
    uploadImg,
    createUser
  )
  .delete(authenticateUser, authorizePermissions('admin'), deleteAllUsers)
router
  .route('/:slug')
  .get(authenticateUser, getUser)
  .put(authenticateUser, updateUser)
  .delete(authenticateUser, deleteUser)
  .patch(authenticateUser, authorizePermissions('admin'), updateUserRole)

router
  .route('/:slug/picture')
  .get(getUserPicture)
  .patch(uploadImg, updateUserImage)
router.route('/:slug/articles').get(getArticlesByUser)

module.exports = router
