// File: backend/tests/case.test.js
/**
 * Case API tests using Jest + Supertest
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // assume server.js exports the express app
const User = require('../models/User');
const Case = require('../models/Case');

let server;
let clientToken;
let lawyerToken;
let clientId;
let lawyerId;

beforeAll(async () => {
  server = app.listen(0);
  await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1/legal-platform-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Create client user
  const clientRes = await request(server).post('/api/auth/register').send({
    name: 'Client User',
    email: 'client@example.com',
    password: 'password123',
    role: 'CLIENT',
    country: 'US',
  });
  clientToken = clientRes.body.token;
  clientId = (await User.findOne({ email: 'client@example.com' }))._id;

  // Create lawyer user
  const lawyerRes = await request(server).post('/api/auth/register').send({
    name: 'Lawyer User',
    email: 'lawyer@example.com',
    password: 'password123',
    role: 'LAWYER',
    country: 'US',
    barNumber: 'BAR12345',
  });
  lawyerToken = lawyerRes.body.token;
  lawyerId = (await User.findOne({ email: 'lawyer@example.com' }))._id;
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
  await server.close();
});

describe('Case Endpoints', () => {
  let caseId;

  it('should allow client to create a case', async () => {
    const res = await request(server)
      .post('/api/cases')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        title: 'Test Case',
        description: 'Test case description',
        lawyer: lawyerId,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.title).toBe('Test Case');
    caseId = res.body._id;
  });

  it('should list cases for client', async () => {
    const res = await request(server)
      .get('/api/cases')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should allow fetching case by id', async () => {
    const res = await request(server)
      .get(`/api/cases/${caseId}`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body._id).toBe(caseId);
  });

  it('should allow updating case status by lawyer', async () => {
    const res = await request(server)
      .patch(`/api/cases/${caseId}`)
      .set('Authorization', `Bearer ${lawyerToken}`)
      .send({ status: 'IN_PROGRESS' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('IN_PROGRESS');
  });
});
