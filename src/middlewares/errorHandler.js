export const errorHandler = (err, req, res, next) => {
  console.error("Error: ", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "서버 오류가 발생했습니다.";

  // Sequelize - ValidationError
  if (err.name === "SequelizeValidationError") {
    statusCode = 400;
    message = err.errors.map((e) => e.message).join(", ");
  }

  // Sequelize - Unique Constraint Error
  if (err.name === "SequelizeUniqueConstraintError") {
    statusCode = 409;
    const field = err.errors[0]?.path || "값";
    const value = err.errors[0]?.value || "";
    if (field === "name" && err.table === "categories") {
      message = `이미 존재하는 카테고리 이름입니다: ${value}`;
    } else {
      message = `중복된 ${field}가 존재합니다: ${value}`;
    }
  }

  // Sequelize - Foreign Key Constraint Error
  if (err.name === "SequelizeForeignKeyConstraintError") {
    statusCode = 400;
    message = "참조 무결성 오류가 발생했습니다.";
  }

  // JWT - Token Expired
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "인증 토큰이 만료되었습니다.";
  }

  // JWT - Invalid Token
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "유효하지 않은 인증 토큰입니다.";
  }

  // JWT - Not Before Error
  if (err.name === "NotBeforeError") {
    statusCode = 401;
    message = "인증 토큰이 아직 유효하지 않습니다.";
  }

  // PostgreSQL - Unique Constraint (직접 쿼리 시)
  if (err.code === "23505") {
    statusCode = 409;
    const detail = err.detail || "";
    if (detail.includes("categories_name_key")) {
      const match = detail.match(/Key \(name\)=\((.+?)\)/);
      const categoryName = match ? match[1] : "";
      message = `이미 존재하는 카테고리 이름입니다: ${categoryName}`;
    } else {
      message = "중복된 값이 존재합니다.";
    }
  }

  // 몽구스 - ValidationError (하위 호환성)
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(", ");
  }

  // 몽구스 - Duplicate Key (하위 호환성)
  if (err.code && err.code === 11000) {
    statusCode = 409;
    message = `중복된 값이 존재합니다: ${Object.keys(err.keyValue).join(", ")}`;
  }

  const response = {
    success: false,
    message,
  };

  // 개발 환경에서만 스택 트레이스 포함
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};