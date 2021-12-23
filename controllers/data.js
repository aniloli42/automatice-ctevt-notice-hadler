const scrapper = require("../services/scrapper")
const Data = require("./../models/data")
const { createPost } = require("./../services/facebook")
const createShortLink = require("./../services/linkShortner")

const noticeReviewAndPost = async () => {
  try {
    const scrappedData = await scrapper()

    const lastNotice = await getLastNotice()

    const index = scrappedData.findIndex(
      (data) => data.notice_title == lastNotice.notice_title
    )

    if (index === 0) return

    if (index !== -1) scrappedData.splice(index)

    await postNotice(scrappedData.reverse())

    await saveNotices(scrappedData.reverse())
  } catch (error) {
    console.log(error)
  }
}

const getLastNotice = async () => {
  try {
    const lastNotice = await Data.findOne().sort({ _id: -1 })

    return lastNotice
  } catch (error) {
    console.log(error)
  }
}

const saveNotices = async (notices) => {
  try {
    await Data.insertMany(notices)
  } catch (error) {
    console.log(error)
  }
}

const postNotice = async (notices) => {
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
}

module.exports = noticeReviewAndPost
