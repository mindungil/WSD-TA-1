import express from "express";
import helmet from 'helmet';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectMongodb } from "./config/mongodb.config.js";
import { connectRedis } from "./config/redis.config.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { specs, swaggerUi } from "./swagger/index.js";
import router from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const HOST = process.env.HOST;

// db 연결
connectMongodb();
connectRedis();

// 미들웨어
app.use(cors());
app.use(helmet());
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({extended: true}));

// 라우트
app.use('/api', router);

// 스웨거
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Book Library API Documentation"
}));

app.get("/", (req, res) => {
  res.send("Hello World");
});

// 글로벌 에러 핸들러
app.use(errorHandler);

// 서버 실행
app.listen(PORT,HOST, () => {
  console.log(`서버 실행 중: http://${HOST}:${PORT}`);
});