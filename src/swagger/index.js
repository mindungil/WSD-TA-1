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

// API 스펙 파일들 로드
const bookSpec = YAML.load(path.join(__dirname, 'specs/book.yaml'));
const reviewSpec = YAML.load(path.join(__dirname, 'specs/review.yaml'));
const userSpec = YAML.load(path.join(__dirname, 'specs/user.yaml'));
const wishlistSpec = YAML.load(path.join(__dirname, 'specs/wishlist.yaml'));
const cartSpec = YAML.load(path.join(__dirname, 'specs/cart.yaml'));
const orderSpec = YAML.load(path.join(__dirname, 'specs/order.yaml'));
const categorySpec = YAML.load(path.join(__dirname, 'specs/category.yaml'));

// 서버 URL을 동적으로 설정하는 함수
export const getSwaggerSpecs = (req) => {
  // SSL 인증서 없이 HTTP만 사용하므로 항상 http로 설정
  const protocol = 'http';
  const host = req.get('host') || process.env.SWAGGER_HOST || 'localhost:3000';
  const baseUrl = `${protocol}://${host}`;
  
  const dynamicSpec = {
    ...swaggerDocument,
    servers: [
      {
        url: baseUrl,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ]
  };

  // paths와 components 병합
  dynamicSpec.paths = {
    ...dynamicSpec.paths,
    ...bookSpec.paths,
    ...reviewSpec.paths,
    ...userSpec.paths,
    ...wishlistSpec.paths,
    ...cartSpec.paths,
    ...orderSpec.paths,
    ...categorySpec.paths,
  };

  dynamicSpec.components = {
    ...dynamicSpec.components,
    schemas: {
      ...dynamicSpec.components?.schemas,
      ...bookSpec.components?.schemas,
      ...reviewSpec.components?.schemas,
      ...userSpec.components?.schemas,
      ...wishlistSpec.components?.schemas,
      ...cartSpec.components?.schemas,
      ...orderSpec.components?.schemas,
      ...categorySpec.components?.schemas,
    },
    securitySchemes: {
      ...dynamicSpec.components?.securitySchemes,
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
    definition: dynamicSpec,
    apis: [],
  };

  return swaggerJsdoc(options);
};

// 기본 specs (하위 호환성)
const defaultSpecs = getSwaggerSpecs({ protocol: 'http', get: () => 'localhost:3000' });

export { getSwaggerSpecs, defaultSpecs as specs, swaggerUi };
