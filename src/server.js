require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const { requestPageInformation } = require("./services/facebook");
const getNotices = require("./helper/getNotices");

const app = express();

app.use(
  cors({
    methods: "GET",
  })
);

// establish the connection to MongoDB
connectDB();

const port = process.env.PORT || 4001;

// listen port for server response
app.listen(port, () => {
  console.log(`Server is live on ${port}`);
});

// intial server endpoint
app.get("/", async (req, res) => {
  res.send("Welcome To CTEVT NOTICE Handler Server");
});

app.get("/notices", async (req, res) => {
  try {
    const notices = await getNotices();

    return res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get the facebook status, which status endpoint
app.get("/status", async (req, res) => {
  const response = await requestPageInformation();
  const { id, ...rest } = response;

  res.send(rest);
});
