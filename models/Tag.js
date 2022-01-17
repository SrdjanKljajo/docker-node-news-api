const mongoose = require('mongoose')
const slugify = require('slugify')

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Tag name must be provided'],
      maxlength: 32,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    articles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
  },
  { timestamps: true }
)

// Create slug for name
tagSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true })
  next()
})

const Tag = mongoose.model('Tag', tagSchema)

module.exports = Tag
