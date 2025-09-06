import mongoose from "mongoose";

export const connectMongodb = async () => {
  try {
    const uri = process.env.MONGO_URI;
    const dbName = process.env.DB_NAME;
    const conn = await mongoose.connect(uri, { dbName, autoIndex: true });
    console.log(`몽고디비 연결: ${conn.connection.host}/${dbName}`);
  } catch (err) {
    console.error("몽고디비 연결 에러:", err);
    process.exit(1);
  }
};