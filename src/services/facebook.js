import axios from "axios";
import Token from "../models/token.model.js";
import { config } from "../config/env.js";

const getToken = async () => {
  try {
    const pageAccessToken = await Token.findOne({
      token_type: "page_access_token",
    });

    const currentTime = Date.now() / 1000;

    if (!pageAccessToken) return await generatePageAccessToken();

    if (pageAccessToken?.expires_in < currentTime)
      return await generatePageAccessToken();

    return pageAccessToken.access_token;
  } catch (error) {
    console.error(error);
  }
};

const requestPageInformation = async () => {
  try {
    const accessToken = await getToken();

    const feedURL = new URL(
      `/v18.0/${config.FACEBOOK_PAGE_ID}`,
      config.FACEBOOK_API_BASE_URL
    );

    const serachParams = new URLSearchParams();
    serachParams.set("fields", "id,name,followers_count");

    feedURL.searchParams = serachParams;

    const response = await axios.get(feedURL.href, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
};

const createPost = async ({ message }) => {
  try {
    const accessToken = await getToken();

    const postNoticeURL = new URL(
      `/v18.0/${config.FACEBOOK_PAGE_ID}/feed`,
      config.FACEBOOK_API_BASE_URL
    );

    const noticePostResponse = await axios.post(
      postNoticeURL.href,
      { message, published: true },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const noticePostResponseData = await noticePostResponse.data;

    return noticePostResponseData.id;
  } catch (error) {
    console.error(error);
  }
};

const generatePageAccessToken = async (_id) => {
  try {
    const userAccessToken = await Token.findOne({
      token_type: "user_access_token",
    });

    if (!userAccessToken) throw new Error(`User Access Token Not Found!!!`);

    const currentTime = Date.now() / 1000;

    if (userAccessToken.expires_in < currentTime)
      throw new Error(`User Access Token Expired`);

    const updateTokenURL = new URL(
      `/${config.FACEBOOK_USER_ID}/accounts`,
      config.FACEBOOK_API_BASE_URL
    );

    const searchParams = new URLSearchParams();
    searchParams.set("access_token", userAccessToken.access_token); // User Access Token

    updateTokenURL.searchParams = searchParams;

    const getAccessTokenResponse = await axios.get(updateToken.href);
    const { access_token, expires_in } = await getAccessTokenResponse.data;

    const updateToken = await Token.findOne({ _id }).sort({ _id: -1 });

    updateToken.access_token = access_token;
    updateToken.expires_in = expires_in;

    await updateToken.save();

    return access_token;
  } catch (error) {
    console.error(error);
  }
};

export { createPost, requestPageInformation };
