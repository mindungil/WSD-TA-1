import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const librarySchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    bookId: { type: Types.ObjectId, ref: "Book", required: true, index: true },
    isbn: { type: String, ref: "Book", required: true }
  },
  { timestamps: true }
);

// 유저 × ISBN 중복 방지
librarySchema.index({ userId: 1, isbn: 1 }, { unique: true });

export default model("Library", librarySchema);
