const mongoose = require("mongoose")
const dotenv = require("dotenv")

dotenv.config()

const connectDB = () => {
  mongoose.connect(process.env.DB_URL)

  mongoose.connection.on("error", (err) => {
    return err
  })

  mongoose.connection.on("open", () => {
    console.log("Connected To Database")
  })
}

module.exports = connectDB
