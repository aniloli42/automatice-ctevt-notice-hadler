import notice from "../models/notice.model.js";
import { createPost } from "../services/facebook.js";
import createShortLink from "../services/linkShortner.js";
import scrapper from "../services/scrapper.js";

const reviewNoticeAndPost = async () => {
  try {
    const scrappedNotices = await scrapper();

    console.log("scrappedNotices: ", scrappedNotices);

    if (scrappedNotices == undefined)
      throw new Error(`Unable to scrap the notices. Check the issue`);

    const newNotices = await filterNewNotices(scrappedNotices);

    for await (let notice of newNotices) {
      console.log(notice);
    }
  } catch (error) {
    console.error(error.message);
  }
};

const filterNewNotices = async (scrappedNotices) => {
  return scrappedNotices;
  // const oldNotices = await getOldNotices();
};

const saveNotices = async (notice) => {
  try {
    const newNotice = new notice(notice);
    await newNotice.save();
  } catch (error) {
    console.error(error.message);
  }
};

const postNotice = async (notice) => {
  try {
    await saveNotices(notice);

    await createPost({
      message: `${notice.notice_title}\n\nPublished Date: ${
        notice.published_date
      }\nNotice Link: ${await createShortLink(
        notice.notice_link
      )}\nPublished By: ${
        notice.published_by
      }\n\nAttached File Links:\n${await Promise.all(
        notice.file_links.map(
          async (link) =>
            `${link.file_title}: ${await createShortLink(link.file_link)}\n`
        )
      )}\nSource: https://ctevtexam.org.np \n\n#techaboutneed #ctevtnotices #ctevtexam #ctevtorg`,
    });
  } catch (error) {
    console.error(error.message);
  }
};

const getNotices = async () => {
  try {
    const notices = await notice.find().sort({ _id: -1 }).limit(10);

    return notices;
  } catch (error) {
    console.error(error.message);
  }
};

export default reviewNoticeAndPost;
