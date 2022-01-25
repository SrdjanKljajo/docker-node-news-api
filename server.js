require('express-async-errors')
const express = require('express')
const connectDB = require('./config/db')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const path = require('path')
const morgan = require('morgan')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')

// Connect with database
connectDB()

const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)

const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const { uploadFile, getFileStream } = require('./s3')

const app = express()
app.enable('trust proxy')
//Import route files
const article = require('./routes/article')
const category = require('./routes/category')
const subCategory = require('./routes/subCategory')
const tag = require('./routes/tag')
const auth = require('./routes/auth')
const user = require('./routes/user')

// MIDDLEWARES
// Not found middlevare
const notFound = require('./middlewares/not-found-route')

// Database errors middlevare
const errorHandler = require('./middlewares/error-mongoose')

// Body parser
app.use(express.json())

// Compress all HTTP responses
app.use(compression())

// Cookie parser
app.use(cookieParser(process.env.JWT_SECRET))

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Set security headers
app.use(helmet())

// Prevent XSS attacks
app.use(xss())

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
})
app.use(limiter)

// Prevent http param pollution
app.use(hpp())

// Enable CORS
app.use(cors())

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

// import routes
app.use('/api/v1/article', article)
app.use('/api/v1/category', category)
app.use('/api/v1/sub-category', subCategory)
app.use('/api/v1/tag', tag)
app.use('/api/v1/auth', auth)
app.use('/api/v1/user', user)

app.get('/images/:key', (req, res) => {
  const key = req.params.key
  const readStream = getFileStream(key)
  readStream.pipe(res)
})

app.post('/images', upload.single('image'), async (req, res) => {
  const file = req.file

  // apply filter
  // resize

  const result = await uploadFile(file)
  await unlinkFile(file.path)
  const description = req.body.description
  res.send({ description, imagePath: `/images/${result.Key}` })
})

// Not found route
app.use(notFound)

// Custom database errors
app.use(errorHandler)

const port = process.env.PORT || 4000

app.listen(port, () =>
  console.log(`Server runing on ${process.env.NODE_ENV} mode on port ${port}`)
)
