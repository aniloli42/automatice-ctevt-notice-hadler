const mongoose = require("mongoose")

const ctevtSchema = mongoose.Schema({
  published_date: {
    type: String,
    required: true,
  },
  notice_title: {
    type: String,
    required: true,
  },
  notice_link: {
    type: String,
    required: true,
  },
  file_links: {
    type: [Object],
    required: true,
  },
  published_by: {
    type: String,
    required: true,
  },
})

const data = mongoose.model("ctevtnotices", ctevtSchema)

module.exports = data
