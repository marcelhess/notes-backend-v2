import request from 'supertest';
import app from '../../server.js';
import mongoose from 'mongoose';
import User from '../../models/User.js';

describe('Auth API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  });
  afterAll(async () => {
    await User.deleteMany({ email: /testuser\d+@test\.de/ });
    await mongoose.connection.close();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'testuser1', email: 'testuser1@test.de', password: 'test1234' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'testuser1@test.de');
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'testuser1@test.de', password: 'test1234' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'testuser1@test.de');
  });
}); 