// File: backend/tests/payment.test.js
/**
 * Payment API tests using Jest + Supertest
 *
 * Simulates Razorpay and Stripe payment initiation.
 * Webhook testing is mocked.
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

let server;
let clientToken;
let clientId;

beforeAll(async () => {
  server = app.listen(0);
  await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1/legal-platform-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const clientRes = await request(server).post('/api/auth/register').send({
    name: 'Client User',
    email: 'client@example.com',
    password: 'password123',
    role: 'CLIENT',
    country: 'US',
  });
  clientToken = clientRes.body.token;
  clientId = (await User.findOne({ email: 'client@example.com' }))._id;
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
  await server.close();
});

describe('Payment Endpoints', () => {
  it('should initiate Razorpay order', async () => {
    const res = await request(server)
      .post('/api/payments/razorpay/initiate')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ amount: 100, currency: 'INR' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('order');
    expect(res.body).toHaveProperty('paymentId');
  });

  it('should create Stripe PaymentIntent', async () => {
    const res = await request(server)
      .post('/api/payments/stripe/create-payment-intent')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ amount: 50, currency: 'usd' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('clientSecret');
    expect(res.body).toHaveProperty('paymentId');
  });

  it('should accept webhook (mock)', async () => {
    const res = await request(server)
      .post('/api/payments/webhook')
      .send({ type: 'payment.success', data: { userId: clientId, paymentId: 'mockId' } });

    expect(res.statusCode).toEqual(200);
    expect(res.body.received).toBe(true);
  });
});
