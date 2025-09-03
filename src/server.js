import express from "express";
import helmet from 'helmet';
import dotenv from 'dotenv';
import cors from 'cors';
import connectMongodb from "./config/mongodb.config.js";
import errorHandler from "./middlewares/errorHandler.js";
// import { swaggerSpec, swaggerUi } from "./swagger/config.js";
// import router from "./router/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const HOST = process.env.HOST;

// db 연결
connectMongodb();

// 미들웨어
app.use(cors());
app.use(helmet());
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({extended: true}));

// // 스웨거 경로
// app.use(`/docs`, 
//     swaggerUi.serve, swaggerUi.setup(swaggerSpec)
// );

app.use('/api', router);

app.get("/", (req, res) => {
  res.send("Hello World");
});

// 글로벌 에러 핸들러
app.use(errorHandler);

// 서버 실행
app.listen(PORT,HOST, () => {
  console.log(`서버 실행 중: http://${HOST}:${PORT}`);
});