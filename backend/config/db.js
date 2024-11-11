// database connection file to MongoDB
import { mongoose } from 'mongoose'


// db("admin").createCollection("http://127.0.0.1:27017")

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('http://127.0.0.1:27017', {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    console.log(`mongodb connected: ${conn.connection.host}`.cyan.underline)
  } catch (error) {
    console.log(`Error: ${error.message}`.underline.bold)
    process.exit(1)
  }
}

export default connectDB
