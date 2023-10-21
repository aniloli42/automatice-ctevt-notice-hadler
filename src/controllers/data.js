const scrapper = require("../services/scrapper");
const Data = require("./../models/data");
const { createPost } = require("../services/facebook");
const createShortLink = require("../services/linkShortner");

const getOldNotices = require("../helper/getNotices");

const noticeReviewAndPost = async () => {
  try {
    const scrappedData = await scrapper();
    if (scrappedData === null) return;

    scrappedData.splice(8);

    const oldNotices = await getOldNotices();

    const notices = scrappedData.filter((data) => {
      const match = oldNotices.some(
        (oldNotice) => oldNotice.notice_link === data.notice_link
      );

      if (!match) {
        /* 
        Check the wheather the post is available but link only changed
        */
        return (
          !oldNotices.some(
            (notice) =>
              notice.notice_title === data.notice_title &&
              notice.published_date === data.published_date
          ) && data
        );
      }
    });

    // filter the null value
    const newNotices = notices.filter((notice) => notice && notice.notice_link);
    if (newNotices.length === 0) return;

    console.log(`New Notice: ${newNotices.length}`);

    newNotices.reverse().forEach(async (notice) => await postNotice(notice));
  } catch (error) {
    console.error(error.message);
  }
};

const saveNotices = async (notice) => {
  try {
    const newNotice = new Data(notice);
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

module.exports = noticeReviewAndPost;
