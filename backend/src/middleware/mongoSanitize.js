const cleanObj = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  
  for (const key in obj) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      cleanObj(obj[key]);
    }
  }
};

const mongoSanitize = (req, res, next) => {
  if (req.body) cleanObj(req.body);
  if (req.query) cleanObj(req.query);
  if (req.params) cleanObj(req.params);
  next();
};

module.exports = mongoSanitize;
