import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const libraryItemSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    isbn: { type: String, ref: "Book", required: true },
    memo: { type: String },
    labels: { type: [String], default: [] },
  },
  { timestamps: true }
);

// 유저 × ISBN 중복 방지
libraryItemSchema.index({ userId: 1, isbn: 1 }, { unique: true });

export default model("LibraryItem", libraryItemSchema);
