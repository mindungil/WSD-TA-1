import mongoose from "mongoose";

export const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME,
    });
    console.log(`몽고디비 연결: ${conn.connection.host}`);
  } catch (error) {
    console.error("몽고디비 연결 에러: ", error.message);
    process.exit(1);
  }
};
