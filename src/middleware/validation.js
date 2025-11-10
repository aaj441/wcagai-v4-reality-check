const Joi = require('joi');

const validateDiscovery = (req, res, next) => {
  const schema = Joi.object({
    vertical: Joi.string()
      .valid('healthcare', 'fintech', 'ecommerce', 'education', 'gaming')
      .required(),
    maxResults: Joi.number().integer().min(1).max(50).default(20)
  });

  const { error, value } = schema.validate(req.query);

  if (error) {
    return res.status(400).json({
      error: {
        message: 'Validation error',
        details: error.details.map(d => d.message)
      }
    });
  }

  req.validatedQuery = value;
  next();
};

const validateScan = (req, res, next) => {
  const schema = Joi.object({
    url: Joi.string().uri().required(),
    includeScreenshot: Joi.boolean().default(false)
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: {
        message: 'Validation error',
        details: error.details.map(d => d.message)
      }
    });
  }

  req.validatedBody = value;
  next();
};

const validateVerticalScan = (req, res, next) => {
  const schema = Joi.object({
    vertical: Joi.string()
      .valid('healthcare', 'fintech', 'ecommerce', 'education', 'gaming')
      .required(),
    maxSites: Joi.number().integer().min(1).max(20).default(5)
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: {
        message: 'Validation error',
        details: error.details.map(d => d.message)
      }
    });
  }

  req.validatedBody = value;
  next();
};

module.exports = {
  validateDiscovery,
  validateScan,
  validateVerticalScan
};
