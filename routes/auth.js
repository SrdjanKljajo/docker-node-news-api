const express = require('express')
const router = express.Router()

const {
  register,
  login,
  logout,
  googleLogin,
  accountActivation,
  resetPassword,
  forgotPassword,
} = require('../controllers/auth')

router.post('/register', register)
router.post('/account-activation', accountActivation)
router.post('/login', login)
router.get('/logout', logout)

// google login
router.post('/google-login', googleLogin)

// forgot reset password
router.post('/forgot-password', forgotPassword)
router.put('/reset-password', resetPassword)

module.exports = router
