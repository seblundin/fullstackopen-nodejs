const jwt = require('jsonwebtoken');
const User = require('../models/user');

const errorHandler = (error, _request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }
  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token',
    });
  }
  if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired' });
  }
  next(error);
};

const tokenExtractor = (request, _response, next) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '');
  }
  next();
};

const userExtractor = async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  const user = await User.findById(decodedToken.id);

  if (!user) {
    response.status(400).json({ error: 'Bad user id' });
  }

  request.user = user;

  next();
};

module.exports = { errorHandler, tokenExtractor, userExtractor };
