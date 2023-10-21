const Data = require("../models/data");

const getNotices = async () => {
  try {
    const notices = await Data.find().sort({ _id: -1 }).limit(10);

    return notices;
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = getNotices;
