const scrapper = require("../services/scrapper")
const Data = require("./../models/data")
const { createPost } = require("./../services/facebook")
const createShortLink = require("./../services/linkShortner")

const noticeReviewAndPost = async () => {
  try {
    const scrappedData = await scrapper()

    if (scrappedData === null) return

    const lastNotice = await getLastNotice()

    const index = scrappedData.findIndex(
      (data) =>
        data.notice_title == lastNotice.notice_title &&
        data.published_date == lastNotice.published_date &&
        data.file_links.every(
          (link, index) =>
            link.file_title === lastNotice.file_links[index].file_title
        ) &&
        data.published_by == lastNotice.published_by
    )
    console.log(index)

    return
    if (index === 0) return

    if (index !== -1) scrappedData.splice(index)

    const postResponse = await postNotice(scrappedData.reverse())

    // prevent the post save in database before post, if any post fails then post will not save
    if (postResponse === null) return
    await saveNotices(scrappedData.reverse())
  } catch (error) {
    console.error(error.message)
  }
}

const getLastNotice = async () => {
  try {
    const lastNotice = await Data.findOne().sort({ _id: -1 })

    return lastNotice
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
