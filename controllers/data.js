const scrapper = require("../services/scrapper")
const Data = require("./../models/data")
const { createPost } = require("./../services/facebook")
const createShortLink = require("./../services/linkShortner")

const noticeReviewAndPost = async () => {
  try {
    const scrappedData = await scrapper()

    if (scrappedData === null) return

    const oldNotices = await getOldNotices()

    const newNotices = scrappedData.filter((data) => {
      const match = oldNotices.some((oldNotice) => {
        return (
          oldNotice.notice_title === data.notice_title &&
          oldNotice.published_date === data.published_date &&
          oldNotice.published_by === data.published_by &&
          oldNotice.file_links.every(
            (fileLink, index) =>
              fileLink.file_title === data.file_links[index].file_title
          )
        )
      })

      if (!match) return data
    })

    if (newNotices.length === 0) return

    const postResponse = await postNotice(newNotices.reverse())

    // prevent the post save in database before post, if any post fails then post will not save
    if (postResponse === null) return
    await saveNotices(newNotices.reverse())
  } catch (error) {
    console.error(error.message)
  }
}

const getOldNotices = async () => {
  try {
    const notices = await Data.find().sort({ _id: -1 }).limit(10)

    return notices
  } catch (error) {
    console.error(error.message)
  }
}

const saveNotices = async (notices) => {
  try {
    await Data.insertMany(notices)
  } catch (error) {
    console.error(error.message)
  }
}

const postNotice = async (notices) => {
  try {
    notices.forEach(async (notice) => {
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
      })
    })

    return true
  } catch (error) {
    console.error(error.message)
    return null
  }
}

module.exports = noticeReviewAndPost
