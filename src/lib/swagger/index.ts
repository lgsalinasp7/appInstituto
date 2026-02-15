import { swaggerConfig } from './config';
import { allSchemas } from './schemas';
import { allPaths } from './paths';

export function getSwaggerSpec() {
  return {
    ...swaggerConfig,
    paths: allPaths,
    components: {
      ...swaggerConfig.components,
      schemas: allSchemas,
    },
  };
}
