const mongoose = require('mongoose')
const slugify = require('slugify')
const { ObjectId } = mongoose.Schema

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: 'Name is required',
      minlength: [2, 'Too short'],
      maxlength: [32, 'Too long'],
    },
    slug: {
      type: String,
      unique: true,
    },
    articles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    parentCategory: { type: ObjectId, ref: 'Category', required: true },
  },
  { timestamps: true }
)

// Create slug for name
subCategorySchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true })
  next()
})

const SubCategory = mongoose.model('SubCategory', subCategorySchema)

module.exports = SubCategory
