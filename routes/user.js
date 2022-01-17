const express = require('express')
const router = express.Router()

const {
  getAllUsers,
  deleteAllUsers,
  deleteUser,
  createUser,
  getUser,
} = require('../controllers/user')

const {
  authenticateUser,
  authorizePermissions,
} = require('../middlewares/auth')

//router.use(authenticateUser)

router.route('/').get(getAllUsers).post(createUser).delete(deleteAllUsers)
router.route('/:slug').get(getUser).delete(deleteUser)

module.exports = router
