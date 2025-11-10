const swaggerUiExpress = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'WCAGAI v4.0 API',
    version: '4.0.0',
    description: 'AI-powered web accessibility scanner with vertical intelligence',
    contact: {
      name: 'WCAGAI Team',
      url: 'https://github.com/aaj441/wcagai-v4-reality-check'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    },
    {
      url: 'https://your-app.railway.app',
      description: 'Production server'
    }
  ],
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints'
    },
    {
      name: 'Discovery',
      description: 'Site discovery endpoints'
    },
    {
      name: 'Scan',
      description: 'Accessibility scanning endpoints'
    }
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Check API health status',
        description: 'Returns health status of the API and its dependencies',
        responses: {
          '200': {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    timestamp: { type: 'string', format: 'date-time' },
                    uptime: { type: 'number', example: 123.456 },
                    version: { type: 'string', example: '4.0.0' },
                    redis: { type: 'string', example: 'connected' }
                  }
                }
              }
            }
          },
          '503': {
            description: 'API is unhealthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'unhealthy' },
                    timestamp: { type: 'string', format: 'date-time' },
                    errors: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/discovery': {
      get: {
        tags: ['Discovery'],
        summary: 'Discover sites in a vertical',
        description: 'Discover websites in a specific industry vertical using SerpAPI or fallback data',
        parameters: [
          {
            name: 'vertical',
            in: 'query',
            required: true,
            description: 'Industry vertical to search',
            schema: {
              type: 'string',
              enum: ['healthcare', 'fintech', 'ecommerce', 'education']
            }
          },
          {
            name: 'maxResults',
            in: 'query',
            required: false,
            description: 'Maximum number of results to return',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 50,
              default: 10
            }
          }
        ],
        responses: {
          '200': {
            description: 'Successfully discovered sites',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    vertical: { type: 'string', example: 'healthcare' },
                    sites: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          title: { type: 'string', example: 'Mayo Clinic' },
                          url: { type: 'string', example: 'https://www.mayoclinic.org' },
                          source: { type: 'string', example: 'serpapi' }
                        }
                      }
                    },
                    count: { type: 'integer', example: 10 }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid request parameters',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string', example: 'Validation Error' },
                    details: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/discovery/verticals': {
      get: {
        tags: ['Discovery'],
        summary: 'List available verticals',
        description: 'Get a list of all available industry verticals with their compliance benchmarks',
        responses: {
          '200': {
            description: 'List of available verticals',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    verticals: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'healthcare' },
                          name: { type: 'string', example: 'Healthcare' },
                          avgCompliance: { type: 'number', example: 74 },
                          siteCount: { type: 'integer', example: 5 }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/scan': {
      post: {
        tags: ['Scan'],
        summary: 'Scan a single URL',
        description: 'Perform WCAG accessibility scan on a single URL',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['url'],
                properties: {
                  url: {
                    type: 'string',
                    format: 'uri',
                    example: 'https://www.example.com'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Scan completed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    url: { type: 'string', example: 'https://www.example.com' },
                    complianceScore: { type: 'number', example: 85.5 },
                    violationCount: { type: 'integer', example: 12 },
                    violations: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'color-contrast' },
                          impact: { type: 'string', example: 'serious' },
                          description: { type: 'string' },
                          help: { type: 'string' },
                          helpUrl: { type: 'string', format: 'uri' },
                          nodes: { type: 'array', items: { type: 'object' } }
                        }
                      }
                    },
                    timestamp: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid URL provided',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string', example: 'Validation Error' },
                    details: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Scan failed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string', example: 'Scan failed' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/scan/vertical': {
      post: {
        tags: ['Scan'],
        summary: 'Scan an entire vertical',
        description: 'Discover and scan multiple sites in an industry vertical',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['vertical'],
                properties: {
                  vertical: {
                    type: 'string',
                    enum: ['healthcare', 'fintech', 'ecommerce', 'education'],
                    example: 'healthcare'
                  },
                  maxSites: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 10,
                    default: 5,
                    example: 5
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Vertical scan completed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    vertical: { type: 'string', example: 'healthcare' },
                    results: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          url: { type: 'string' },
                          complianceScore: { type: 'number' },
                          violationCount: { type: 'integer' }
                        }
                      }
                    },
                    summary: {
                      type: 'object',
                      properties: {
                        avgCompliance: { type: 'number', example: 76.5 },
                        totalViolations: { type: 'integer', example: 42 },
                        sitesScanned: { type: 'integer', example: 5 }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid request parameters'
          }
        }
      }
    },
    '/api/scan/status': {
      get: {
        tags: ['Scan'],
        summary: 'Get scanner status',
        description: 'Get current status and statistics of the scanner service',
        responses: {
          '200': {
            description: 'Scanner status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ready' },
                    activeScans: { type: 'integer', example: 2 },
                    maxConcurrent: { type: 'integer', example: 5 },
                    browserReady: { type: 'boolean', example: true }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {},
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key for authentication (optional in development)'
      }
    }
  }
};

module.exports = {
  swaggerUi: swaggerUiExpress,
  swaggerDocument
};
