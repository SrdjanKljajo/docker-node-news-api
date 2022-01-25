const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types
const slugify = require('slugify')

const commentSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

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
      type: ObjectId,
      ref: 'Category',
      required: [true, 'Please provide category'],
    },
    subCategory: { type: ObjectId, ref: 'SubCategory' },
    tags: [{ type: ObjectId, ref: 'Tag' }],
    comments: [commentSchema],
    likes: [],
    unlikes: [],
    user: {
      type: ObjectId,
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
