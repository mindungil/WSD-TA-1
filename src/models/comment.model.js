import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const commentSchema = new Schema(
  {
    reviewId: { type: Types.ObjectId, ref: "Review", required: true, index: true },
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

commentSchema.index({ reviewId: 1, createdAt: -1 });

export default model("Comment", commentSchema);