const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body;

  if (!(username && name && password)) {
    response.status(400).json({ error: 'Username, name or password missing' });
    return;
  }

  if (username.length < 4) {
    response
      .status(400)
      .json({ error: 'Username must be at least 3 characters long' });
    return;
  }

  if (password.length < 4) {
    response
      .status(400)
      .json({ error: 'Password must be at least 3 characters long' });
    return;
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    password: passwordHash,
  });

  const savedUser = await user.save();
  response.status(201).json(savedUser);
});

usersRouter.get('/', async (_request, response) => {
  const allUsers = await User.find({}).populate('blogs', {
    title: 1,
    author: 1,
    url: 1,
    likes: 1,
  });
  response.json(allUsers);
});

module.exports = usersRouter;
