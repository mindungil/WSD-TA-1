# Book Library API

도서 관리 시스템을 위한 RESTful API 서버입니다.

## 🚀 기술 스택

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB (Mongoose 8.18.0)
- **Cache**: Redis 5.8.2
- **Authentication**: JWT
- **External API**: Kakao Book Search API

## 📋 주요 기능

- 사용자 인증 (회원가입, 로그인, JWT)
- 도서 검색 (카카오 API + DB 저장)
- 리뷰/댓글 시스템 (좋아요 기능 포함)
- 개인 서재 및 위시리스트 관리

## 🛠️ 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Server
PORT=3000
HOST=localhost

# Database
MONGODB_URI=mongodb://localhost:27017/book-library
REDIS_URL=redis://localhost:6379

# JWT
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Password Hashing
BCRYPT_SALT_ROUNDS=12

# External API
KAKAO_API_KEY=your_kakao_api_key
```

### 3. 서버 실행
```bash
npm start
```

서버가 실행되면 다음 URL에서 접근할 수 있습니다:
- API 서버: `http://localhost:3000`
- API 문서: `http://localhost:3000/api-docs`

## 📚 API 명세서

### 기본 URL
```
http://localhost:3000/api
```

### 인증
대부분의 API는 JWT Bearer Token 인증이 필요합니다.
```
Authorization: Bearer <access_token>
```

---

## 🔐 인증 API

### 회원가입
```http
POST /api/users/register
Content-Type: application/json

{
  "nickname": "사용자닉네임",
  "email": "user@example.com",
  "password": "password123"
}
```

### 로그인
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 토큰 갱신
```http
POST /api/users/refresh
Content-Type: application/json

{
  "refreshToken": "jwt_refresh_token"
}
```

### 로그아웃
```http
POST /api/users/logout
Authorization: Bearer <access_token>
```

---

## 👤 사용자 API

### 프로필 조회/수정/삭제
```http
GET /api/users/profile
PUT /api/users/profile
DELETE /api/users/profile
Authorization: Bearer <access_token>
```

### 사용자 리뷰/좋아요 조회
```http
GET /api/users/reviews?page=1&limit=10
GET /api/users/reviews/likes?page=1&limit=10
GET /api/users/comments/likes?page=1&limit=10
Authorization: Bearer <access_token>
```

---

## 📖 도서 API

### 도서 등록 (CSV 업로드)
```http
POST /api/books/import/csv
Content-Type: multipart/form-data (file)

file: kyobo_books.csv
```

### 서버 DB 도서 조회
```http
GET /api/books?title=검색어&page=1&limit=10
GET /api/books/{bookId}
GET /api/books/isbn/{isbn}
```

---

## ⭐ 리뷰 API

### 리뷰 CRUD
```http
GET /api/books/{bookId}/reviews?page=1&limit=10
POST /api/books/{bookId}/reviews
PUT /api/books/{bookId}/reviews/{reviewId}
DELETE /api/books/{bookId}/reviews/{reviewId}
Authorization: Bearer <access_token>
```

### 리뷰 좋아요
```http
POST /api/books/{bookId}/reviews/{reviewId}/like
DELETE /api/books/{bookId}/reviews/{reviewId}/like
Authorization: Bearer <access_token>
```

---

## 💬 댓글 API

### 댓글 CRUD
```http
GET /api/books/{bookId}/reviews/{reviewId}/comments?page=1&limit=10
POST /api/books/{bookId}/reviews/{reviewId}/comments
PUT /api/books/{bookId}/reviews/{reviewId}/comments/{commentId}
DELETE /api/books/{bookId}/reviews/{reviewId}/comments/{commentId}
Authorization: Bearer <access_token>
```

### 댓글 좋아요
```http
POST /api/books/{bookId}/reviews/{reviewId}/comments/{commentId}/like
DELETE /api/books/{bookId}/reviews/{reviewId}/comments/{commentId}/like
Authorization: Bearer <access_token>
```

---

## 📚 개인 서재 API

```http
POST /api/users/library
GET /api/users/library/list?page=1&limit=10
GET /api/users/library?bookId=... | ?isbn=...
DELETE /api/users/library/{libraryId}
Authorization: Bearer <access_token>
```

---

## ❤️ 위시리스트 API

```http
POST /api/users/wishlists
GET /api/users/wishlists?page=1&limit=10
DELETE /api/users/wishlists/{wishlistId}
Authorization: Bearer <access_token>
```

---

## 📊 데이터 모델

### User
```json
{
  "_id": "ObjectId",
  "email": "String (unique)",
  "password": "String (hashed)",
  "nickname": "String (unique)",
  "roles": ["String"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Book
```json
{
  "_id": "ObjectId",
  "isbn": "String (unique)",
  "title": "String",
  "authors": ["String"],
  "publisher": "String",
  "price": "Number",
  "sale_price": "Number",
  "contents": "String",
  "thumbnail": "String",
  "publishedAt": "String",
  "status": "String",
  "categories": ["String"],
  "reviewCount": "Number",
  "averageRating": "Number"
}
```

### Review
```json
{
  "_id": "ObjectId",
  "bookId": "ObjectId (ref: Book)",
  "userId": "ObjectId (ref: User)",
  "title": "String",
  "content": "String",
  "rating": "Number (0-5, required)",
  "likes": "Number",
  "status": "String (ACTIVE/DELETED)"
}
```

### Comment
```json
{
  "_id": "ObjectId",
  "reviewId": "ObjectId (ref: Review)",
  "userId": "ObjectId (ref: User)",
  "content": "String",
  "likes": "Number"
}
```

### Library
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: User)",
  "bookId": "ObjectId (ref: Book)",
  "isbn": "String"
}
```

### Wishlist
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: User)",
  "bookId": "ObjectId (ref: Book)",
  "note": "String"
}
```

---

## 🔒 보안 기능

- JWT 인증 (Access Token 1시간 + Refresh Token 7일)
- bcryptjs 비밀번호 해싱
- Redis를 통한 Refresh Token 관리
- CORS, Helmet 보안 설정
- 권한 검증 (소유자만 수정/삭제)
- Unique Index를 통한 중복 방지

---

## 📝 에러 처리

API는 일관된 에러 응답 형식을 사용합니다:

```json
{
  "success": false,
  "message": "에러 메시지",
  "statusCode": 400
}
```

### 주요 HTTP 상태 코드
- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스 없음
- `409`: 중복 데이터
- `500`: 서버 오류

---

## ⚡ 성능 최적화

- **Redis 캐싱**: 리뷰 목록 조회 (60초 TTL), 버전 키 기반 무효화
- **데이터베이스 인덱싱**: 자주 조회되는 필드에 인덱스 설정
- **페이지네이션**: 모든 목록 조회에 적용
- **Bulk Operations**: 도서 검색 시 효율적인 DB 업데이트

---

## 📄 라이선스

ISC License