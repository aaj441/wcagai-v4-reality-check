/**
 * API Documentation Routes
 *
 * Serves OpenAPI/Swagger documentation
 */

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Load OpenAPI specification
const openApiPath = path.join(__dirname, '../../openapi.yaml');
const openApiFile = fs.readFileSync(openApiPath, 'utf8');
const swaggerDocument = YAML.parse(openApiFile);

// Serve Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'WCAGAI v4.0 API Documentation'
}));

module.exports = router;
