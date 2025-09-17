import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const reviewSchema = new Schema(
  {
    bookId: { type: Types.ObjectId, ref: "Book", required: true, index: true },
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String },
    content: { type: String, required: true },
    rating: { type: Number, min: 0, max: 5, required: true },
    likes: { type: Number, default: 0, index: true },
    status: { type: String, enum: ["ACTIVE", "DELETED"], default: "ACTIVE" },
  },
  { timestamps: true }
);

// 좋아요 순 정렬 최적화
reviewSchema.index({ status: 1, likes: -1 });

export default model("Review", reviewSchema);