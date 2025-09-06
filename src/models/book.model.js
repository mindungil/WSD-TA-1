import mongoose from "mongoose";

const { Schema, model } = mongoose;

const bookSchema = new Schema(
  {
    isbn: { type: String, required: true, unique: true, index: true},
    title: { type: String, required: true },
    authors: { type: [String], default: [] },
    publisher: { type: String },
    price: {type: Number },
    contents: { type: String },
    sale_price: { type: Number },
    thumbnail: { type: String },
    publishedAt: { type: String },
    status: { type: String }
  },
  { timestamps: true }
);

export default model("Book", bookSchema);