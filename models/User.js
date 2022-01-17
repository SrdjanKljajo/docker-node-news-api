const mongoose = require('mongoose')
const slugify = require('slugify')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: [true, 'Username must be provided'],
      maxlength: 32,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      trim: true,
      required: [true, 'Password must be provided'],
    },
    role: {
      type: String,
      enum: ['user', 'publisher', 'moderator', 'admin'],
      default: 'user',
    },
    resetPasswordLink: {
      data: String,
      default: '',
    },
    articles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
  },
  { timestamps: true }
)

// Create slug for name
userSchema.pre('save', async function (next) {
  this.slug = await slugify(this.username, { lower: true })
  next()
})

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next()
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model('User', userSchema)

module.exports = User
