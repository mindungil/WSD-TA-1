import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    nickname: { type: String, required: true, unique: true },
    roles: { type: [String], default: ["USER"] },
  },
  { timestamps: true }
);

export default model("User", userSchema);