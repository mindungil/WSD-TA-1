import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const reviewSchema = new Schema(
  {
    bookIsbn: { type: String, ref: "Book", required: true, index: true },
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String },
    content: { type: String, required: true },
    rating: { type: Number, min: 0, max: 5 },
    likeCount: { type: Number, default: 0, index: true },
    commentCount: { type: Number, default: 0 },
    status: { type: String, enum: ["ACTIVE", "DELETED"], default: "ACTIVE", index: true },
  },
  { timestamps: true }
);

// 좋아요 순 정렬 최적화
reviewSchema.index({ status: 1, likeCount: -1 });

export default model("Review", reviewSchema);