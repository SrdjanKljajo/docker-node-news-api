const mongoose = require('mongoose')
const slugify = require('slugify')

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title must be provided'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    body: {
      type: String,
      required: [true, 'Body must be provided'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please provide category'],
    },
    //subCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubCategories' }],
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user'],
    },
  },
  { timestamps: true }
)

// Create slug for name
articleSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true })
  next()
})

const Article = mongoose.model('Article', articleSchema)

module.exports = Article
