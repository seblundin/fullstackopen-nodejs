const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (_request, response) => {
  const allBlogs = await Blog.find({})
  response.json(allBlogs)
})

blogsRouter.post('/', async (request, response) => {
  if (!request.body.url || !request.body.title) {
    response.status(400).json({ error: 'Title or url missing' })
    return
  }

  const blog = new Blog(request.body)

  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params

  const deleted = await Blog.findByIdAndRemove(id)

  if (deleted) {
    response.status(204).end()
  } else {
    response.status(404).end()
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const blog = request.body
  const { id } = request.params

  const updatedBlog = await Blog.findByIdAndUpdate(id, blog, { new: true })
  if (updatedBlog) {
    response.status(200).json(updatedBlog)
  } else {
    response.status(404).end()
  }
})

module.exports = blogsRouter
