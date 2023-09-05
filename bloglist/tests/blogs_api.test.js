const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const { listWithManyBlogs, blogsInDb } = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(listWithManyBlogs)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('the correct amount of blogs is returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(listWithManyBlogs.length)
})

test('the id parameter is named id', async () => {
  const blogsAtStart = await blogsInDb()

  expect(blogsAtStart[0].id).toBeDefined()
})

test('a valid blog can be added ', async () => {
  const newBlog = {
    title: 'This is a cool blog',
    author: 'A cool blog author',
    url: 'A cool url',
    likes: 10,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await blogsInDb()
  expect(blogsAtEnd).toHaveLength(listWithManyBlogs.length + 1)

  const contents = blogsAtEnd.map((b) => b.title)
  expect(contents).toContain('This is a cool blog')
})

test('a blog without likes can be created', async () => {
  const blogObject = {
    title: 'No one likes me...',
    author: 'Disliked author',
    url: 'Some url',
    likes: undefined,
  }

  const newBlog = new Blog(blogObject)
  expect(newBlog.likes).toBe(0)
})

test('a blog that has no title can\'t be added', async () => {
  const newBlog = {
    title: undefined,
    author: 'Some author',
    url: 'Some url',
    likes: 10,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await blogsInDb()
  expect(blogsAtEnd).toHaveLength(listWithManyBlogs.length)
})

test('a blog that has no url can\'t be added', async () => {
  const newBlog = {
    title: 'Some title',
    author: 'Some author',
    url: undefined,
    likes: 10,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await blogsInDb()
  expect(blogsAtEnd).toHaveLength(listWithManyBlogs.length)
})

test('removing a blog works with a correct id', async () => {
  const { _id, title } = listWithManyBlogs[0]
  await api
    .delete(`/api/blogs/${_id}`)
    .expect(204)

  const blogsAtEnd = await blogsInDb()
  expect(blogsAtEnd).toHaveLength(listWithManyBlogs.length - 1)

  const blogTitles = blogsAtEnd.map((b) => b.title)
  expect(blogTitles).not.toContain(title)
})

test('removing a blog with the incorrect id returns an error', async () => {
  await api
    .delete(`/api/blogs/${listWithManyBlogs[0]._id.split('').reverse().join('')}`)
    .expect(404)

  await api
    .delete('/api/blogs/')
    .expect(404)
})

test('updating a blog works', async () => {
  const firstBlog = listWithManyBlogs[0]
  const updatedBlog = { ...firstBlog, likes: 2 }
  const response = await api
    .put(`/api/blogs/${firstBlog._id}`)
    .send(updatedBlog)

  expect(response.headers['content-type']).toMatch(/json/)
  expect(response.status).toEqual(200)
  expect(response.body.id).toEqual(updatedBlog._id)

  const blogsAtEnd = await blogsInDb()
  expect(blogsAtEnd.length).toEqual(listWithManyBlogs.length)
  expect(updatedBlog._id).toEqual(blogsAtEnd[0].id)
})

test('updating an invalid blog results in an error', async () => {
  const firstBlog = listWithManyBlogs[0]

  await api
    .put('/api/blogs/')
    .expect(404)

  await api
    .put(`/api/blogs/${firstBlog._id.split('').reverse().join('')}`)
    .send(firstBlog)
    .expect(404)
})

afterAll(async () => {
  await mongoose.connection.close()
})
