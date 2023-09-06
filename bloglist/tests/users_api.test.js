const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');

describe('/api/users', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('should not create a user with invalid data - short username', async () => {
    const invalidUser = {
      username: 'us',
      password: 'password123',
      name: 'John Doe',
    };

    const response = await request(app).post('/api/users').send(invalidUser);

    expect(response.status).toEqual(400);
    expect(response.body.error).toEqual(
      'Username must be at least 3 characters long'
    );
  });

  test('should not create a user with invalid data - short password', async () => {
    const invalidUser = {
      username: 'username123',
      password: 'pw',
      name: 'John Doe',
    };

    const response = await request(app).post('/api/users').send(invalidUser);

    expect(response.status).toEqual(400);
    expect(response.body.error).toEqual(
      'Password must be at least 3 characters long'
    );
  });

  test('should not create a user with duplicate username', async () => {
    const existingUser = new User({
      username: 'existinguser',
      password: 'password123',
      name: 'Existing User',
    });
    await existingUser.save();

    const newUser = {
      username: 'existinguser',
      password: 'newpassword123',
      name: 'New User',
    };

    const response = await request(app).post('/api/users').send(newUser);

    expect(response.status).toEqual(400);
    expect(response.body.error).toContain('expected `username` to be unique');
  });

  test('should create a valid user', async () => {
    const validUser = {
      username: 'newuser',
      password: 'password123',
      name: 'New User',
    };

    const response = await request(app).post('/api/users').send(validUser);

    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty('id');
  });

  test('should return all users when sending a GET request', async () => {
    const user1 = {
      username: 'user1',
      password: 'password123',
      name: 'User One',
    };

    const user2 = {
      username: 'user2',
      password: 'password456',
      name: 'User Two',
    };

    await User.insertMany([user1, user2]);

    const response = await request(app).get('/api/users');

    expect(response.status).toEqual(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty('username', 'user1');
    expect(response.body[1]).toHaveProperty('username', 'user2');
  });
});
