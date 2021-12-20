const mongoose = require("mongoose")

const tokenSchema = mongoose.Schema(
  {
    access_token: {
      type: String,
      required: true,
    },
    token_type: {
      type: String,
      required: true,
    },
    expires_in: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
)

const token = mongoose.model("facebooktoken", tokenSchema)

module.exports = token
