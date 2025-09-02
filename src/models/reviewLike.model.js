import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const reviewLikeSchema = new Schema(
  {
    reviewId: { type: Types.ObjectId, ref: "Review", required: true, index: true },
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// 유저 × 리뷰 중복 방지
reviewLikeSchema.index({ userId: 1, reviewId: 1 }, { unique: true });

export default model("ReviewLike", reviewLikeSchema);