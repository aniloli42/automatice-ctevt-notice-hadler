require("dotenv").config()
const axios = require("axios")

const { BITLY_ACCESS_TOKEN, BITLY_API_URL } = process.env

const createShortLink = async (longURL) => {
  try {
    const res = await axios.post(
      BITLY_API_URL,
      {
        long_url: longURL,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BITLY_ACCESS_TOKEN}`,
        },
      }
    )

    return res.data.link
  } catch (error) {
    console.log(error)
  }
}

module.exports = createShortLink
