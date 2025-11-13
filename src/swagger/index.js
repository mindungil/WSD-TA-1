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
const reviewSpec = YAML.load(path.join(__dirname, 'specs/review.yaml'));
const userSpec = YAML.load(path.join(__dirname, 'specs/user.yaml'));
const wishlistSpec = YAML.load(path.join(__dirname, 'specs/wishlist.yaml'));
const cartSpec = YAML.load(path.join(__dirname, 'specs/cart.yaml'));
const orderSpec = YAML.load(path.join(__dirname, 'specs/order.yaml'));
const categorySpec = YAML.load(path.join(__dirname, 'specs/category.yaml'));

// paths와 components 병합
swaggerDocument.paths = {
  ...swaggerDocument.paths,
  ...bookSpec.paths,
  ...reviewSpec.paths,
  ...userSpec.paths,
  ...wishlistSpec.paths,
  ...cartSpec.paths,
  ...orderSpec.paths,
  ...categorySpec.paths,
};

swaggerDocument.components = {
  ...swaggerDocument.components,
  schemas: {
    ...swaggerDocument.components?.schemas,
    ...bookSpec.components?.schemas,
    ...reviewSpec.components?.schemas,
    ...userSpec.components?.schemas,
    ...wishlistSpec.components?.schemas,
    ...cartSpec.components?.schemas,
    ...orderSpec.components?.schemas,
    ...categorySpec.components?.schemas,
  },
  securitySchemes: {
    ...swaggerDocument.components?.securitySchemes,
    ...bookSpec.components?.securitySchemes,
    ...reviewSpec.components?.securitySchemes,
    ...userSpec.components?.securitySchemes,
    ...wishlistSpec.components?.securitySchemes,
    ...cartSpec.components?.securitySchemes,
    ...orderSpec.components?.securitySchemes,
    ...categorySpec.components?.securitySchemes,
  }
};

const options = {
  definition: swaggerDocument,
  apis: [], // 파일 기반이므로 빈 배열
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };