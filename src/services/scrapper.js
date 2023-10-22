import puppeteer from "puppeteer";
import { config } from "../config/env.js";

const scrapper = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--incognito", "--no-sandbox"],
    defaultViewport: null,
  });

  try {
    const page = await browser.newPage();

    await page.goto(config.WEBSITE_URL, {
      waitUntil: "networkidle2",
      timeout: 0,
    });

    const scrapeData = await page.evaluate(scrapNotices);

    return scrapeData;
  } catch (error) {
    console.error(error.message);
  } finally {
    process.once("SIGTERM", async () => await closeBrowser(browser));
  }
};

async function closeBrowser(browser) {
  console.log("Shutting Down...");
  console.log("----------------------------");
  if (browser) await browser.close();
  process.exit();
}

function scrapNotices() {
  const TABLE_BODY_SELECTOR = "#table1 > tbody";
  const tBody = document.querySelector(TABLE_BODY_SELECTOR);

  const TABLE_ROW_SELECTOR = "tr";
  const tRow = tBody.querySelectorAll(TABLE_ROW_SELECTOR);

  console.log(tBody, tRow);
}

export default scrapper;
