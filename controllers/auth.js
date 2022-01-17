const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const {
  attachCookiesToResponse,
  createTokenUser,
  createJWT,
  isTokenValid,
} = require('../utils')
const { OAuth2Client } = require('google-auth-library')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// sendgrid
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// @desc    Register a new user with account activation
// @route   POST /api/vi/auth/register
// @access  Public
const register = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body

  if (password !== confirmPassword)
    throw new CustomError.BadRequestError('Passwords dont match')

  const token = createJWT({
    payload: { username, email, password },
    expireTime: process.env.JWT_ACTIVATION_ACCOUNT_EXPIRES,
  })

  const emailData = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Activation token`,
    html: `
                <h1>Use this token for account activation</h1>
                <p>${token}</p>
                <hr />
            `,
  }

  sgMail.send(emailData)
  return res.json({
    status: 'success',
    message: `Email sent to address ${email}. Follow instructions to activate account`,
  })
}

// @desc    Register a new user with account activation
// @route   POST /api/v1/auth/account-activation
// @access  Private
const accountActivation = async (req, res) => {
  const { token } = req.body

  const verifyUser = async tokenErr => {
    try {
      if (tokenErr) {
        return res.status(401).json({
          status: 'fail',
          tokenErr,
        })
      }
      const { username, email, password } = jwt.decode(token)

      const user = await User.findOne({ email })
      if (user) {
        return res.status(400).json({
          status: 'fail',
          msg: `User with email ${email} already exist`,
        })
      }

      const newUser = await User.create({ username, email, password })
      const tokenUser = createTokenUser(newUser)
      attachCookiesToResponse({ res, user: tokenUser })
      res.status(StatusCodes.CREATED).json({
        status: 'success',
        msg: `User ${username} seccessfuly created`,
        user: tokenUser,
      })
    } catch (error) {
      res.status(401).json({
        status: 'fail',
        error: 'User not verified, please try again later',
      })
    }
  }

  if (token) {
    isTokenValid({ token, verifyUser })
  } else {
    throw new CustomError.BadRequestError('Please add token')
  }
}

// @desc    Login user
// @route   POST /api/vi/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    throw new CustomError.BadRequestError('Please provide email and password')

  const user = await User.findOne({ email })

  if (!user) throw new CustomError.UnauthenticatedError('Invalid Credentials')

  const isPasswordCorrect = await user.matchPassword(password)
  if (!isPasswordCorrect)
    throw new CustomError.UnauthenticatedError('Invalid Credentials')

  const tokenUser = createTokenUser(user)
  attachCookiesToResponse({ res, user: tokenUser })

  res.status(StatusCodes.OK).json({
    status: 'success',
    user: tokenUser,
  })
}

// @desc    Forgot password
// @route   PUT /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })

  if (!user)
    throw new CustomError.BadRequestError(`User with email ${email} dont exist`)

  const resetPasswordToken = createJWT({
    payload: { payload: { _id: user._id, username: user.username } },
    expireTime: process.env.JWT_ACTIVATION_ACCOUNT_EXPIRES,
  })

  const emailData = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Reset password token`,
    html: `
                <h1>Token for reset your password</h1>
                <p>${resetPasswordToken}</p>
                <hr />
            `,
  }

  await user.updateOne({ resetPasswordToken })

  sgMail.send(emailData)
  return res.json({
    status: 'success',
    message: `Email sent to address ${email}. Follow instructions to activate account`,
  })
}

// @desc    Reset password
// @route   PUT /api/v1/auth/reset-password
// @access  Private
const resetPassword = async (req, res) => {
  let { resetPasswordToken, newPassword, confirmPassword } = req.body

  if (newPassword !== confirmPassword)
    throw new CustomError.BadRequestError('Passwords dont match')

  const verifyUser = async tokenErr => {
    try {
      if (tokenErr) {
        return res.status(401).json({
          status: 'fail',
          tokenErr,
        })
      }

      const user = await User.findOne({ resetPasswordToken })
      if (!resetPasswordToken) {
        return res.status(404).json({
          status: 'fail',
          errMsg: 'Token not found',
        })
      }
      newPassword = await bcrypt.hash(newPassword, 12)
      await user.update({
        password: newPassword,
        resetPasswordToken: '',
      })

      const tokenUser = createTokenUser(user)
      attachCookiesToResponse({ res, user: tokenUser })
      res.status(StatusCodes.CREATED).json({
        status: 'success',
        msg: `User password seccessfuly updated`,
      })
    } catch (error) {
      res
        .status(401)
        .json({ status: 'fail', error: 'Token is not valid enymore' })
    }
  }

  if (resetPasswordToken) {
    isTokenValid({ token: resetPasswordToken, verifyUser })
  } else {
    throw new CustomError.BadRequestError('Please add token')
  }
}

// @desc    Google login
// @route   POST /api/v1/auth/google-login
// @access  Public
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const googleLogin = async (req, res) => {
  const idToken = req.body.tokenId
  client
    .verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    .then(async (response, err) => {
      const { email_verified, name, email, jti } = response.payload

      if (email_verified) {
        const user = await User.findOne({ email })
        if (user) {
          const tokenUser = createTokenUser(user)
          attachCookiesToResponse({ res, user: tokenUser })
          res.status(StatusCodes.OK).json({
            status: 'success',
            user: tokenUser,
          })
        } else {
          let password = jti
          const user = await User.create({ name, email, password })

          const tokenUser = createTokenUser(user)
          attachCookiesToResponse({ res, user: tokenUser })
          res.status(StatusCodes.OK).json({
            status: 'success',
            user: tokenUser,
          })
        }
      } else {
        throw new CustomError.BadRequestError(
          'Google registration failed! Please try again'
        )
      }
    })
}

const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  })

  res.status(StatusCodes.OK).json({
    ststus: 'success',
    msg: 'user logged out!',
  })
}

module.exports = {
  register,
  login,
  logout,
  googleLogin,
  accountActivation,
  forgotPassword,
  resetPassword,
}
