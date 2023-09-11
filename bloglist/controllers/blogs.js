const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const { userExtractor } = require('../utils/middleware');

blogsRouter.get('/', async (_request, response) => {
  const allBlogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1,
  });
  response.json(allBlogs);
});

blogsRouter.post('/', userExtractor, async (request, response) => {
  const { user } = request;

  const blog = new Blog({
    ...request.body,
    user: user.id,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog.id);
  await user.save();

  response.status(201).json(savedBlog);
});

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const { id } = request.params;
  const blog = await Blog.findById(id);

  if (!blog) {
    response.status(404).end();
    return;
  }

  if (request.user.id.toString() === blog.user.toString()) {
    const deleted = await Blog.findByIdAndDelete(id);
    if (deleted) {
      response.status(204).end();
      return;
    }
    response.status(500).end();
    return;
  }
  response.status(403).end();
});

blogsRouter.put('/:id', async (request, response) => {
  const blog = request.body;
  const { id } = request.params;

  const updatedBlog = await Blog.findByIdAndUpdate(id, blog, { new: true });
  if (updatedBlog) {
    response.status(200).json(updatedBlog);
  } else {
    response.status(404).end();
  }
});

module.exports = blogsRouter;
