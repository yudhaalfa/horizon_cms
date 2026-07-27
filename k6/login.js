/**
 * k6 Performance Test — Sign-In Page Load
 *
 * Measures HTTP response time for loading the authentication page
 * of the React SPA served from localhost:3000.
 *
 * NOTE: This is a pure SPA. k6 measures the HTTP delivery of the
 * HTML/JS bundle from the dev server, not client-side rendering time.
 *
 * Prerequisites:
 *   1. brew install k6  (macOS) | choco install k6 (Windows)
 *   2. npm start   (start dev server on port 3000)
 *   3. npm run test:k6:login
 *
 * Thresholds:
 *   - 95th percentile response time < 2000ms
 *   - Error rate < 1%
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ─── Custom Metrics ───────────────────────────────────────────────────────────
const errorRate = new Rate('errors');
const pageLoadTrend = new Trend('page_load_time', true);

// ─── Load Stages ─────────────────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: '15s', target: 10 },  // Ramp up to 10 VUs
    { duration: '30s', target: 50 },  // Ramp up to 50 VUs (peak load)
    { duration: '30s', target: 50 },  // Hold at 50 VUs
    { duration: '15s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% of requests must complete < 2s
    errors: ['rate<0.01'],              // Error rate must stay < 1%
    http_req_failed: ['rate<0.01'],     // HTTP error rate < 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // ─── Load main SPA bundle (index.html) ─────────────────────────────────
  const loginPageRes = http.get(`${BASE_URL}/auth/sign-in`, {
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
    tags: { name: 'login_page' },
  });

  const loginOk = check(loginPageRes, {
    'login page status is 200': (r) => r.status === 200,
    'login page body is not empty': (r) => r.body !== null && r.body.length > 0,
    'login page returns HTML': (r) => r.headers['Content-Type']
      ? r.headers['Content-Type'].includes('text/html')
      : true,
    'login page response time < 2s': (r) => r.timings.duration < 2000,
  });

  errorRate.add(!loginOk);
  pageLoadTrend.add(loginPageRes.timings.duration);

  // ─── Simulate user reading the page ────────────────────────────────────
  sleep(Math.random() * 2 + 1); // 1–3 second think time

  // ─── Also load register page (same bundle, different route) ────────────
  const registerPageRes = http.get(`${BASE_URL}/register`, {
    tags: { name: 'register_page' },
  });

  check(registerPageRes, {
    'register page status is 200': (r) => r.status === 200,
    'register page response time < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}

/**
 * Summary handler — prints a human-readable report at the end.
 */
export function handleSummary(data) {
  const p95 = data.metrics.http_req_duration?.values?.['p(95)'];
  const errRate = data.metrics.errors?.values?.rate;

  console.log('\n=== k6 Login Page Load Summary ===');
  console.log(`Total requests:    ${data.metrics.http_reqs?.values?.count || 0}`);
  console.log(`p95 response time: ${p95 ? p95.toFixed(2) + 'ms' : 'N/A'}`);
  console.log(`Error rate:        ${errRate ? (errRate * 100).toFixed(2) + '%' : '0%'}`);
  console.log('==================================\n');

  return {
    stdout: JSON.stringify(data, null, 2),
  };
}
