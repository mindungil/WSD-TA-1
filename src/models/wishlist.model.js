import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const wishlistSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    bookId: { type: Types.ObjectId, ref: "Book", required: true },
    note: { type: String },
  },
  { timestamps: true }
);

// 유저 × 책 중복 방지
wishlistSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export default model("Wishlist", wishlistSchema);