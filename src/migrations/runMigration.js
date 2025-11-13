import { connectPostgreSQL } from "../config/postgresql.config.js";
import createTables from "./createTables.js";
import dotenv from "dotenv";

dotenv.config();

const runMigration = async () => {
  try {
    await connectPostgreSQL();
    await createTables();
    console.log("마이그레이션이 완료되었습니다.");
    process.exit(0);
  } catch (error) {
    console.error("마이그레이션 실패:", error);
    process.exit(1);
  }
};

runMigration();

