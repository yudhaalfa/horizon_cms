/**
 * k6 Performance Test — Dashboard Page Load
 *
 * Simulates concurrent users loading the merchant and admin dashboards.
 * Tests how the dev server handles concurrent authenticated dashboard requests.
 *
 * NOTE: This is a pure SPA with client-side auth (Zustand/localStorage).
 * k6 measures HTTP bundle delivery — actual dashboard rendering is client-side.
 * For full E2E browser testing, consider k6 browser module or Playwright.
 *
 * Prerequisites:
 *   1. brew install k6
 *   2. npm start
 *   3. npm run test:k6:dashboard
 *
 * Thresholds:
 *   - 95th percentile response time < 2000ms
 *   - Error rate < 1%
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ─── Custom Metrics ───────────────────────────────────────────────────────────
const errorRate = new Rate('dashboard_errors');
const merchantDashTrend = new Trend('merchant_dashboard_load_ms', true);
const adminDashTrend = new Trend('admin_dashboard_load_ms', true);

// ─── Load Stages ─────────────────────────────────────────────────────────────
export const options = {
  scenarios: {
    merchant_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 20 },  // Ramp up
        { duration: '30s', target: 40 },  // Peak: 40 concurrent merchants
        { duration: '10s', target: 0 },   // Ramp down
      ],
      tags: { role: 'merchant' },
    },
    admin_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 5 },   // Admins are fewer
        { duration: '30s', target: 10 },  // Peak: 10 concurrent admins
        { duration: '10s', target: 0 },
      ],
      tags: { role: 'admin' },
      startTime: '5s',                    // Stagger start vs merchant load
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<4000'],
    dashboard_errors: ['rate<0.01'],
    http_req_failed: ['rate<0.01'],
    merchant_dashboard_load_ms: ['p(95)<2000'],
    admin_dashboard_load_ms: ['p(95)<2500'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// ─── Merchant Dashboard Scenario ──────────────────────────────────────────────
export default function () {
  const role = __ENV.SCENARIO_ROLE || 'merchant';

  if (role === 'admin') {
    runAdminDashboard();
  } else {
    runMerchantDashboard();
  }
}

function runMerchantDashboard() {
  group('Merchant Dashboard', () => {
    const res = http.get(`${BASE_URL}/merchant/default`, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      tags: { name: 'merchant_dashboard' },
    });

    const ok = check(res, {
      'merchant dashboard status 200': (r) => r.status === 200,
      'merchant dashboard has body': (r) => r.body !== null && r.body.length > 100,
      'merchant dashboard loads < 2s': (r) => r.timings.duration < 2000,
      'merchant TTFB < 600ms': (r) => r.timings.waiting < 600,
    });

    errorRate.add(!ok);
    merchantDashTrend.add(res.timings.duration);

    sleep(Math.random() * 3 + 1); // 1–4s think time

    // Simulate navigating sub-pages
    const subPages = [
      `${BASE_URL}/merchant/wallet`,
      `${BASE_URL}/merchant/data-tables`,
      `${BASE_URL}/merchant/marketplace`,
    ];
    const subPage = subPages[Math.floor(Math.random() * subPages.length)];
    const subRes = http.get(subPage, { tags: { name: 'merchant_subpage' } });

    check(subRes, {
      'merchant subpage status 200': (r) => r.status === 200,
    });

    sleep(1);
  });
}

function runAdminDashboard() {
  group('Admin Dashboard', () => {
    const res = http.get(`${BASE_URL}/admin/default`, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      tags: { name: 'admin_dashboard' },
    });

    const ok = check(res, {
      'admin dashboard status 200': (r) => r.status === 200,
      'admin dashboard has body': (r) => r.body !== null && r.body.length > 100,
      'admin dashboard loads < 2.5s': (r) => r.timings.duration < 2500,
      'admin TTFB < 800ms': (r) => r.timings.waiting < 800,
    });

    errorRate.add(!ok);
    adminDashTrend.add(res.timings.duration);

    sleep(Math.random() * 5 + 2); // 2–7s think time (admin reviews data longer)
  });
}

export function handleSummary(data) {
  const p95 = data.metrics.http_req_duration?.values?.['p(95)'];
  const merchantP95 = data.metrics.merchant_dashboard_load_ms?.values?.['p(95)'];
  const adminP95 = data.metrics.admin_dashboard_load_ms?.values?.['p(95)'];
  const errRate = data.metrics.dashboard_errors?.values?.rate;

  console.log('\n=== k6 Dashboard Load Summary ===');
  console.log(`Overall p95 response time:   ${p95 ? p95.toFixed(2) + 'ms' : 'N/A'}`);
  console.log(`Merchant dashboard p95:      ${merchantP95 ? merchantP95.toFixed(2) + 'ms' : 'N/A'}`);
  console.log(`Admin dashboard p95:         ${adminP95 ? adminP95.toFixed(2) + 'ms' : 'N/A'}`);
  console.log(`Error rate:                  ${errRate ? (errRate * 100).toFixed(2) + '%' : '0%'}`);
  console.log('=================================\n');

  return {
    stdout: JSON.stringify(data, null, 2),
  };
}
