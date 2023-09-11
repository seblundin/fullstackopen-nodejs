const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');
const {
  listWithManyBlogs,
  listWithOneBlog,
  blogsInDb,
} = require('./test_helper');

const api = supertest(app);

let token;

beforeAll(async () => {
  await User.deleteMany({});
  await Blog.deleteMany({});

  const validUser = {
    username: 'newuser',
    password: 'password123',
    name: 'New User',
  };

  await api.post('/api/users').send(validUser);

  const login = await api
    .post('/api/login')
    .send({ username: 'newuser', password: 'password123' });
  token = login.body.token;

  const blogList = listWithManyBlogs.map((list) => ({
    ...list,
    user: token.id,
  }));
  await Blog.insertMany(blogList);
});

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('the correct amount of blogs is returned', async () => {
  const response = await api.get('/api/blogs');

  expect(response.body).toHaveLength(listWithManyBlogs.length);
});

test('the id parameter is named id', async () => {
  const blogsAtStart = await blogsInDb();

  expect(blogsAtStart[0].id).toBeDefined();
});

test('a blog without likes can be created', () => {
  const { likes, ...noLikes } = listWithOneBlog[0];

  const newBlog = new Blog(noLikes);
  expect(newBlog.likes).toBe(0);
});

test('a valid blog can be added ', async () => {
  await api
    .post('/api/blogs')
    .send(listWithOneBlog[0])
    .set('Authorization', `Bearer ${token}`)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await blogsInDb();
  expect(blogsAtEnd).toHaveLength(listWithManyBlogs.length + 1);

  const contents = blogsAtEnd.map((b) => b.title);
  expect(contents).toContain('This list would be better as an object');
});

test('removing a blog works with a correct id', async () => {
  const { _id, title } = listWithOneBlog[0];
  await api
    .delete(`/api/blogs/${_id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204);

  const blogsAtEnd = await blogsInDb();
  expect(blogsAtEnd).toHaveLength(listWithManyBlogs.length);

  const blogTitles = blogsAtEnd.map((b) => b.title);
  expect(blogTitles).not.toContain(title);
});

test("a blog that has no title can't be added", async () => {
  const { title, ...noTitle } = listWithOneBlog[0];

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(noTitle)
    .expect(400)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await blogsInDb();
  expect(blogsAtEnd).toHaveLength(listWithManyBlogs.length);
});

test("a blog that has no url can't be added", async () => {
  const { url, ...noUrl } = listWithOneBlog[0];

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(noUrl)
    .expect(400)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await blogsInDb();
  expect(blogsAtEnd).toHaveLength(listWithManyBlogs.length);
});

test("a blog without authorization can't be created", async () => {
  await api
    .post('/api/blogs')
    .send(listWithOneBlog[0])
    .expect(401)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await blogsInDb();
  expect(blogsAtEnd).toHaveLength(listWithManyBlogs.length);
});

test('removing a blog with the incorrect id returns an error', async () => {
  await api
    .delete(`/api/blogs/2a423bb71b54a676234d17f8`)
    .set('Authorization', `Bearer ${token}`)
    .expect(404);

  await api
    .delete('/api/blogs/0')
    .set('Authorization', `Bearer ${token}`)
    .expect(400);
});

test('updating a blog works', async () => {
  const firstBlog = listWithManyBlogs[0];
  const updatedBlog = { ...firstBlog, likes: 2 };
  const response = await api
    .put(`/api/blogs/${firstBlog._id}`)
    .set('Authorization', `Bearer ${token}`)
    .send(updatedBlog);

  expect(response.headers['content-type']).toMatch(/json/);
  expect(response.status).toEqual(200);
  expect(response.body.id).toEqual(updatedBlog._id);

  const blogsAtEnd = await blogsInDb();
  expect(blogsAtEnd.length).toEqual(listWithManyBlogs.length);
  expect(updatedBlog._id).toEqual(blogsAtEnd[0].id);
});

test('updating an invalid blog results in an error', async () => {
  const firstBlog = listWithManyBlogs[0];

  await api.put('/api/blogs/').expect(404);

  await api
    .put(`/api/blogs/${firstBlog._id.split('').reverse().join('')}`)
    .send(firstBlog)
    .expect(404);
});

afterAll(async () => {
  await mongoose.connection.close();
});
