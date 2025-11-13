import express from "express";
import helmet from 'helmet';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectPostgreSQL } from "./config/postgresql.config.js";
import { connectRedis } from "./config/redis.config.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { getSwaggerSpecs, swaggerUi } from "./swagger/index.js";
import router from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const HOST = process.env.HOST;

// 리버스 프록시/로드밸런서 신뢰 설정 (클라우드 배포 시 필요)
// SSL 인증서 없이 HTTP만 사용하므로 X-Forwarded-Proto는 신뢰하지 않음
app.set('trust proxy', false);

// db 연결
connectPostgreSQL();
connectRedis();

// 미들웨어
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({extended: true}));

// 라우트
app.use('/api', router);

// 스웨거
app.use('/api-docs', swaggerUi.serve, (req, res, next) => {
  const specs = getSwaggerSpecs(req);
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Book Library API Documentation"
  })(req, res, next);
});

app.get("/", (req, res) => {
  res.send("Hello W-S-D");
});

// 글로벌 에러 핸들러
app.use(errorHandler);

// 서버 실행
app.listen(PORT,HOST, () => {
  console.log(`서버 실행 중: http://${HOST}:${PORT}`);
});