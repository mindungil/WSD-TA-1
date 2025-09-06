export class CustomError extends Error {
  constructor(message = "서버 오류가 발생했습니다.", statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}