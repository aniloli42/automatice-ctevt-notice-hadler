const express = require("express")
const dotenv = require("dotenv")
const axios = require("axios")

const connectDB = require("./config/db")
const { requestData } = require("./services/facebook")
const noticeReviewAndPost = require("./controllers/data")

dotenv.config()
const app = express()

// establish the connection to MongoDB
connectDB()

const port = process.env.PORT || 4001

// listen port for server response
app.listen(port, () => {
  console.log(`Server is live on ${port}`)
})

// intial server endpoint
app.get("/", async (req, res) => {
  res.send("Welcome To CTEVT NOTICE Handler Server")
})

// get the facebook status, which status endpoint
app.get("/status", async (req, res) => {
  const response = await requestData()
  const { id, ...rest } = response

  res.send(rest)
})

// keep server alive, call app every 45 mins of interval
setInterval(() => {
  axios.get("https://ctevtnotice.herokuapp.com/")
}, 2700000)

// handle notice fetching, comparing, post and save every 3 mins of interval
setInterval(() => {
  noticeReviewAndPost()
}, 180000)
