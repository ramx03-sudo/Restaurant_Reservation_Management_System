const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Assign parsed values back to requests safely (Express query/params are read-only getters)
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) {
      Object.keys(req.query).forEach(key => delete req.query[key]);
      Object.assign(req.query, parsed.query);
    }
    if (parsed.params) {
      Object.keys(req.params).forEach(key => delete req.params[key]);
      Object.assign(req.params, parsed.params);
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = validate;
