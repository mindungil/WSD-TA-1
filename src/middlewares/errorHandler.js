export const errorHandler = (err, req, res, next) => {
  console.error("Error: ", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "서버 오류가 발생했습니다.";

  // 몽구스 - ValidationError
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(", ");
  }

  // 몽구스 - Duplicate Key
  if (err.code && err.code === 11000) {
    statusCode = 409;
    message = `중복된 값이 존재합니다: ${Object.keys(err.keyValue).join(", ")}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: err.stack,
  });
};