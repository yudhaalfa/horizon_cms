/**
 * k6 Performance Test — Public Payment Page Load
 *
 * Simulates load on the public-facing payment page (/pay/:token).
 * This page is the highest-traffic route: all customers access it
 * to complete payments.
 *
 * NOTE: This is a pure SPA. k6 measures HTTP delivery of the bundle,
 * not browser rendering or client-side JS execution time.
 *
 * Prerequisites:
 *   1. brew install k6
 *   2. npm start
 *   3. npm run test:k6:payment
 *
 * Thresholds:
 *   - 95th percentile response time < 1500ms (payment page is latency-sensitive)
 *   - Error rate < 0.5%
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ─── Custom Metrics ───────────────────────────────────────────────────────────
const errorRate = new Rate('payment_page_errors');
const payPageTrend = new Trend('payment_page_load_ms', true);
const statusPageTrend = new Trend('status_page_load_ms', true);
const totalRequests = new Counter('total_payment_requests');

// ─── Load Stages ─────────────────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: '10s', target: 5 },   // Warm-up
    { duration: '20s', target: 30 },  // Ramp up
    { duration: '30s', target: 50 },  // Peak: simulate 50 concurrent customers
    { duration: '20s', target: 20 },  // Scale down
    { duration: '10s', target: 0 },   // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500', 'p(99)<3000'],
    payment_page_errors: ['rate<0.005'],   // < 0.5% error rate
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Simulated invoice tokens (mimic what would be in Zustand store links)
const SAMPLE_TOKENS = [
  'INV-1001',
  'INV-1002',
  'INV-TESTTOKEN',
  'INV-LOAD-TEST',
];

function randomToken() {
  return SAMPLE_TOKENS[Math.floor(Math.random() * SAMPLE_TOKENS.length)];
}

export default function () {
  const token = randomToken();

  group('Public Payment Page', () => {
    // ─── Load payment page ─────────────────────────────────────────────
    const payRes = http.get(`${BASE_URL}/pay/${token}`, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Cache-Control': 'no-cache',
      },
      tags: { name: 'pay_page', token },
    });

    const payOk = check(payRes, {
      'payment page status 200': (r) => r.status === 200,
      'payment page has body': (r) => r.body !== null && r.body.length > 100,
      'payment page loads within 1.5s': (r) => r.timings.duration < 1500,
      'TTFB < 500ms': (r) => r.timings.waiting < 500,
    });

    errorRate.add(!payOk);
    payPageTrend.add(payRes.timings.duration);
    totalRequests.add(1);

    // Think time: customer reading the checkout page
    sleep(Math.random() * 3 + 2); // 2–5 seconds
  });

  group('Payment Status Page', () => {
    // ─── Load the status page (post-payment redirect target) ───────────
    const statusRes = http.get(`${BASE_URL}/public-status/${randomToken()}`, {
      tags: { name: 'status_page' },
    });

    check(statusRes, {
      'status page status 200': (r) => r.status === 200,
      'status page loads within 1.5s': (r) => r.timings.duration < 1500,
    });

    statusPageTrend.add(statusRes.timings.duration);

    sleep(1);
  });
}

export function handleSummary(data) {
  const p95 = data.metrics.http_req_duration?.values?.['p(95)'];
  const p99 = data.metrics.http_req_duration?.values?.['p(99)'];
  const errRate = data.metrics.payment_page_errors?.values?.rate;
  const total = data.metrics.total_payment_requests?.values?.count;

  console.log('\n=== k6 Public Payment Page Load Summary ===');
  console.log(`Total payment page hits: ${total || 0}`);
  console.log(`p95 response time:       ${p95 ? p95.toFixed(2) + 'ms' : 'N/A'}`);
  console.log(`p99 response time:       ${p99 ? p99.toFixed(2) + 'ms' : 'N/A'}`);
  console.log(`Error rate:              ${errRate ? (errRate * 100).toFixed(2) + '%' : '0%'}`);
  console.log('===========================================\n');

  return {
    stdout: JSON.stringify(data, null, 2),
  };
}
