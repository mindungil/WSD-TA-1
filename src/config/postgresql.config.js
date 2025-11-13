import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.POSTGRES_DB || process.env.DB_NAME,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST || "localhost",
    port: process.env.POSTGRES_PORT || 5432,
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export const connectPostgreSQL = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL 연결 성공");
  } catch (error) {
    console.error("PostgreSQL 연결 실패:", error);
    process.exit(1);
  }
};

export default sequelize;

