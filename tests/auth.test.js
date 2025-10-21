// File: backend/tests/auth.test.js
/**
 * Auth API tests using Jest + Supertest
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // assume server.js exports the express app
const User = require('../models/User');

let server;

beforeAll(async () => {
  server = app.listen(0); // random available port
  // Connect to test DB
  await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1/legal-platform-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
  await server.close();
});

describe('Auth Endpoints', () => {
  let token;
  let refreshToken;

  it('should register a new client user', async () => {
    const res = await request(server)
      .post('/api/auth/register')
      .send({
        name: 'Test Client',
        email: 'client@example.com',
        password: 'password123',
        role: 'CLIENT',
        country: 'US',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should login the client user', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'client@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
    refreshToken = res.body.refreshToken;
  });

  it('should fetch current user with token', async () => {
    const res = await request(server)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.email).toBe('client@example.com');
  });

  it('should fail login with wrong password', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({ email: 'client@example.com', password: 'wrongpass' });

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toBeDefined();
  });
});
