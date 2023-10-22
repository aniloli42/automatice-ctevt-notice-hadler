import mongoose from "mongoose";

const ctevtSchema = mongoose.Schema(
  {
    published_date: {
      type: String,
      required: true,
    },
    notice_title: {
      type: String,
      required: true,
    },
    notice_link: {
      type: String,
      required: true,
      unique: true,
    },
    file_links: {
      type: [Object],
      required: true,
    },
    published_by: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const notice = mongoose.model("notice", ctevtSchema);

export default notice;
