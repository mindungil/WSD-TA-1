import mongoose from "mongoose";

const { Schema, model } = mongoose;

const bookSchema = new Schema(
  {
    _id: { type: String }, // isbn13
    isbn10: { type: String },
    title: { type: String, required: true },
    authors: { type: [String], default: [] },
    publisher: { type: String },
    thumbnailUrl: { type: String },
    publishedAt: { type: String },
    category: { type: [String], default: [] },
    kakaoRaw: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default model("Book", bookSchema);