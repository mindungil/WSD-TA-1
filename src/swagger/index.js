// swagger/index.js (업데이트된 버전)
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 메인 swagger.yaml 파일 로드
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

// API 스펙 파일들 로드 및 병합
const bookSpec = YAML.load(path.join(__dirname, 'specs/book.yaml'));
const librarySpec = YAML.load(path.join(__dirname, 'specs/library.yaml'));
const reviewSpec = YAML.load(path.join(__dirname, 'specs/review.yaml'));
const commentSpec = YAML.load(path.join(__dirname, 'specs/comment.yaml'));
const userSpec = YAML.load(path.join(__dirname, 'specs/user.yaml'));
const wishlistSpec = YAML.load(path.join(__dirname, 'specs/wishlist.yaml'));
const reviewLikeSpec = YAML.load(path.join(__dirname, 'specs/reviewLike.yaml'));
const commentLikeSpec = YAML.load(path.join(__dirname, 'specs/commentLike.yaml'));

// paths와 components 병합
swaggerDocument.paths = {
  ...swaggerDocument.paths,
  ...librarySpec.paths,
  ...bookSpec.paths,
  ...reviewSpec.paths,
  ...commentSpec.paths,
  ...userSpec.paths,
  ...wishlistSpec.paths,
  ...reviewLikeSpec.paths,
  ...commentLikeSpec.paths,
};

swaggerDocument.components = {
  ...swaggerDocument.components,
  schemas: {
    ...swaggerDocument.components?.schemas,
    ...bookSpec.components?.schemas,
    ...librarySpec.components?.schemas,
    ...reviewSpec.components?.schemas,
    ...commentSpec.components?.schemas,
    ...userSpec.components?.schemas,
    ...wishlistSpec.components?.schemas,
    ...reviewLikeSpec.components?.schemas,
    ...commentLikeSpec.components?.schemas,
  },
  securitySchemes: {
    ...swaggerDocument.components?.securitySchemes,
    ...bookSpec.components?.securitySchemes,
    ...librarySpec.components?.securitySchemes,
    ...reviewSpec.components?.securitySchemes,
    ...commentSpec.components?.securitySchemes,
    ...userSpec.components?.securitySchemes,
    ...wishlistSpec.components?.securitySchemes,
    ...reviewLikeSpec.components?.securitySchemes,
    ...commentLikeSpec.components?.securitySchemes,
  }
};

const options = {
  definition: swaggerDocument,
  apis: [], // 파일 기반이므로 빈 배열
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };