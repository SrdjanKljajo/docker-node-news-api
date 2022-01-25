const mongoose = require('mongoose')
const slugify = require('slugify')

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Category name must be provided'],
      maxlength: 32,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    subCategories: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
    ],
    articles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
  },
  { timestamps: true }
)

// Create slug for name
categorySchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true })
  next()
})

const Category = mongoose.model('Category', categorySchema)

module.exports = Category
