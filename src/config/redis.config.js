import { createClient } from "redis";

let client;

export const connectRedis = async () => {
  const url = process.env.REDIS_URL;
  client = createClient({ url });
  client.on("error", (err) => console.error("레디스 클라이언트 에러", err));
  await client.connect();
  console.log("레디스 연결 성공");
  return client;
};

export const getRedis = () => {
  if (!client) throw new Error("레디스 연결 실패");
  return client;
};
