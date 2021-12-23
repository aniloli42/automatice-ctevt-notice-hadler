const axios = require("axios")
const dotenv = require("dotenv")
const FB = require("fb")

const Token = require("../models/token")

dotenv.config()

const BASE_URL = process.env.FACEBOOK_BASEURL

const getToken = async () => {
  try {
    const token = await Token.findOne()

    if (!token) return console.log("Token Not Available")

    const currentTime = Date.now()

    if (token.expiresIn < currentTime) {
      const response = await regenerateAccessToken(
        token.access_token,
        token._id
      )

      return response.access_token
    }

    return token.access_token
  } catch (error) {
    console.log(error)
  }
}

const requestData = async () => {
  try {
    const accessToken = await getToken()

    const response = await axios.get(
      `${BASE_URL}?fields=id%2Cname%2Cfollowers_count%2Cunread_message_count%2Cunseen_message_count&access_token=${accessToken}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    return response.data
  } catch (error) {
    return error?.response?.data
  }
}

const createPost = async ({ message }) => {
  try {
    const accessToken = await getToken()

    FB.setAccessToken(accessToken)

    FB.api("/me/feed", "POST", { message }, function (response) {
      console.log("Notice Response: ", response)
    })
  } catch (e) {
    console.log(e)
  }
}

const regenerateAccessToken = async (token, _id) => {
  try {
    const url = `https://graph.facebook.com/v12.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_CLIENT_ID}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&fb_exchange_token=${token}`

    const getTime = Date.now()

    const response = await axios.get(url)

    const updateToken = await Token.findOne({ _id })

    const { access_token, expiresIn } = await response.data

    const expiresAt = expiresIn + getTime

    updateToken.access_token = access_token
    updateToken.expiresIn = expiresAt

    await updateToken.save()

    return access_token
  } catch (error) {
    console.log(error)
  }
}

module.exports = { createPost, requestData }
