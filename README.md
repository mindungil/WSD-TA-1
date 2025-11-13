# Book Library API

도서 관리 시스템을 위한 RESTful API 서버입니다.

## 기술 스택

- Runtime: Node.js (ES Modules)
- Framework: Express.js 5.1.0
- Database: PostgreSQL (Sequelize 6.37.5)
- Cache: Redis 5.8.2
- Authentication: JWT
- API Documentation: Swagger

## 주요 기능

- 사용자 인증 및 관리 (JWT 기반)
- 도서 관리 (CSV 업로드, 검색, 조회)
- 리뷰 시스템
- 위시리스트 관리
- 장바구니 및 주문 관리
- 카테고리 관리

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 `.env.example`을 참고하여 다음 변수들을 설정하세요:

```env
# Server
PORT=3000
HOST=localhost

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=book_library
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# Redis
REDIS_URL=redis://localhost:6379

# JWT
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Password Hashing
BCRYPT_SALT_ROUNDS=12
```

### 3. 데이터베이스 마이그레이션
```bash
npm run migrate
```

### 4. 서버 실행
```bash
npm start
```

서버가 실행되면 다음 URL에서 접근할 수 있습니다:
- API 서버: `http://localhost:3000`
- API 문서: `http://localhost:3000/api-docs`

## Docker를 사용한 실행

### Docker Compose로 실행
```bash
docker-compose up -d
```

모든 서비스(PostgreSQL, Redis, 애플리케이션)가 자동으로 시작되고 데이터베이스 마이그레이션이 실행됩니다.

### 환경 변수 설정
프로덕션 환경에서는 `.env` 파일을 생성하거나 `docker-compose.yml`의 환경 변수를 수정하세요.

### 서비스 중지
```bash
docker-compose down
```

데이터를 유지하려면:
```bash
docker-compose down
```

데이터까지 삭제하려면:
```bash
docker-compose down -v
```

### 개별 서비스 관리
```bash
docker-compose up -d postgres redis
docker-compose up app
```

## API 명세서

### 기본 URL
```
http://localhost:3000/api
```

### 인증
대부분의 API는 JWT Bearer Token 인증이 필요합니다.
```
Authorization: Bearer <access_token>
```

## 인증 API

### 회원가입
```http
POST /api/users/register
Content-Type: application/json

{
  "name": "홍길동",
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

## 사용자 API

### 프로필 조회/수정/삭제
```http
GET /api/users/profile
PUT /api/users/profile
DELETE /api/users/profile
Authorization: Bearer <access_token>
```

### 사용자 리뷰 조회
```http
GET /api/users/reviews?page=1&limit=10
Authorization: Bearer <access_token>
```

## 도서 API

### 도서 등록
```http
POST /api/books
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "isbn": "9788936433598",
  "title": "데미안",
  "publisherName": "창비",
  "authorNames": ["헤르만 헤세"],
  "categoryNames": ["소설"],
  "price": 15000,
  "stock": 100,
  "publishedDate": "2020-01-01",
  "description": "책 내용 요약"
}
```

### 도서 조회
```http
GET /api/books?title=검색어&page=1&limit=10
GET /api/books/{bookId}
```

### 도서 수정
```http
PUT /api/books/{bookId}
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "title": "수정된 제목",
  "price": 16000,
  "stock": 150
}
```

## 리뷰 API

### 리뷰 CRUD
```http
GET /api/books/{bookId}/reviews?page=1&limit=10
POST /api/books/{bookId}/reviews
PUT /api/books/{bookId}/reviews/{reviewId}
DELETE /api/books/{bookId}/reviews/{reviewId}
Authorization: Bearer <access_token>
```

## 위시리스트 API

```http
POST /api/users/wishlists
GET /api/users/wishlists?page=1&limit=10
DELETE /api/users/wishlists/{wishlistId}
Authorization: Bearer <access_token>
```

## 장바구니 API

```http
POST /api/carts
GET /api/carts?page=1&limit=10
PUT /api/carts/{cartId}
DELETE /api/carts/{cartId}
DELETE /api/carts
Authorization: Bearer <access_token>
```

## 주문 API

```http
POST /api/orders
GET /api/orders?page=1&limit=10
GET /api/orders/{orderId}
PUT /api/orders/{orderId}
PUT /api/orders/{orderId}/cancel
Authorization: Bearer <access_token>
```

## 카테고리 API

```http
GET /api/categories
POST /api/categories
PUT /api/categories/{categoryId}
GET /api/categories/{categoryId}/books?page=1&limit=10
Authorization: Bearer <access_token>
```

## 데이터베이스 구조

### 주요 테이블
- users: 사용자 정보
- books: 도서 정보
- publishers: 출판사 정보
- authors: 저자 정보
- categories: 카테고리 정보
- reviews: 리뷰
- wishlists: 위시리스트
- carts: 장바구니
- orders: 주문
- order_items: 주문 항목

### 관계
- books - publishers: N:1
- books - authors: N:M (book_authors)
- books - categories: N:M (book_categories)
- users - reviews: 1:N
- users - orders: 1:N
- users - wishlists: 1:N
- users - carts: 1:N

## 보안 기능

- JWT 인증 (Access Token 1시간 + Refresh Token 7일)
- bcryptjs 비밀번호 해싱
- Redis를 통한 Refresh Token 관리
- CORS, Helmet 보안 설정
- 권한 검증 (소유자만 수정/삭제)
- Unique Index를 통한 중복 방지

## 에러 처리

API는 일관된 에러 응답 형식을 사용합니다:

```json
{
  "success": false,
  "message": "에러 메시지"
}
```

### 주요 HTTP 상태 코드
- 200: 성공
- 201: 생성 성공
- 400: 잘못된 요청 (유효성 검사 실패, 참조 무결성 오류)
- 401: 인증 실패 (토큰 없음, 토큰 만료, 유효하지 않은 토큰)
- 403: 권한 없음
- 404: 리소스 없음
- 409: 중복 데이터 (카테고리 이름 중복 등)
- 500: 서버 오류

## 성능 최적화

- Redis 캐싱: 리뷰 목록 조회 (60초 TTL), 버전 키 기반 무효화
- 데이터베이스 인덱싱: 자주 조회되는 필드에 인덱스 설정
- 페이지네이션: 모든 목록 조회에 적용
- 트랜잭션: 주문 생성/취소 시 원자성 보장

## 라이선스

ISC License
