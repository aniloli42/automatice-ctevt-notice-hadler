const puppeteer = require("puppeteer");
const { config } = require("../config/env");
require("dotenv").config();

const scrapper = async () => {
  const browseURL = config.WEBSITE_URL;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--incognito", "--no-sandbox"],
    defaultViewport: null,
  });

  try {
    const page = await browser.newPage();

    await page.goto(browseURL, {
      waitUntil: "networkidle2",
      timeout: 0,
    });

    await page.waitForSelector(
      "#table1 > tbody > tr:nth-child(1) > td:nth-child(2)",
      { visible: true }
    );

    const scrapeData = await page.evaluate(() => {
      let data = [];

      const tbody = document.querySelector("#table1 > tbody");

      Array.from(tbody.children).forEach((notice) => {
        data.push({
          published_date: notice.children[1].innerText,
          notice_title: notice.children[2].children[0].innerText,
          notice_link: notice.children[2].children[0].href,
          file_links: [...notice.children[3].children].map((link) => {
            return { file_link: link.href, file_title: link.children[0].title };
          }),
          published_by: notice.children[4].innerText,
        });
      });

      return data;
    });

    await browser.close();

    return scrapeData;
  } catch (error) {
    browser.close();
    console.error(error.message);

    return null;
  }
};

module.exports = scrapper;
