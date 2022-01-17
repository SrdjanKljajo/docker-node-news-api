require('express-async-errors')
const express = require('express')
const connectDB = require('./config/db')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const path = require('path')
const morgan = require('morgan')
const cors = require('cors')

// Connect with database
connectDB()

const app = express()
app.enable('trust proxy')
//Import route files
const article = require('./routes/article')
const category = require('./routes/category')
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

// Enable CORS
app.use(cors())

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

// import routes
app.use('/api/v1/article', article)
app.use('/api/v1/category', category)
app.use('/api/v1/auth', auth)
app.use('/api/v1/user', user)

// Not found route
app.use(notFound)

// Custom database errors
app.use(errorHandler)

const port = process.env.PORT || 4000

app.listen(port, () =>
  console.log(`Server runing on ${process.env.NODE_ENV} mode on port ${port}`)
)
