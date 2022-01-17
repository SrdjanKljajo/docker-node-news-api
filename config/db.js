const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`MongoDB is connected on: ${conn.connection.host} host`)
  } catch (error) {
    console.error(error)
  }
}
module.exports = connectDB
