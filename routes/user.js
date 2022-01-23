const express = require('express')
const router = express.Router()

const {
  getAllUsers,
  deleteAllUsers,
  deleteUser,
  createUser,
  getUser,
  updateUserRole,
} = require('../controllers/user')

const {
  authenticateUser,
  authorizePermissions,
} = require('../middlewares/auth')

//router.use(authenticateUser)

router.route('/').get(getAllUsers).post(createUser).delete(deleteAllUsers)
router.route('/:slug').get(getUser).delete(deleteUser).patch(updateUserRole)

module.exports = router
