import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const commentLikeSchema = new Schema(
  {
    commentId: { type: Types.ObjectId, ref: "Comment", required: true, index: true },
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// 유저 × 댓글 중복 방지
commentLikeSchema.index({ userId: 1, commentId: 1 }, { unique: true });

export default model("CommentLike", commentLikeSchema);