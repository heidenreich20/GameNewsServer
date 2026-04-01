const Joi = require("joi");

const validateNews = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    text: Joi.string().required(),
    image: Joi.string().uri().required(),
    category: Joi.string().required(),
    author: Joi.string().required(),
    type: Joi.string().required(),
    console: Joi.array().items(Joi.string()).optional()
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

module.exports = validateNews;