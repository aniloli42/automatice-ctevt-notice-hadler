const express = require("express")
const dotenv = require("dotenv")

const connectDB = require("./config/db")
const { requestData } = require("./services/facebook")
const noticeReviewAndPost = require("./controllers/data")

dotenv.config()
const app = express()

connectDB()

const port = process.env.PORT || 4001
app.listen(port, () => {
  console.log(`Server is live on ${port}`)
})

app.get("/", async (req, res) => {
  const response = await requestData()
  const { id, ...rest } = response

  res.send(rest)
})

setInterval(
  () => {
    noticeReviewAndPost()
  },
  300,
  000
)
