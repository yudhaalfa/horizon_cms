# Payment Gateway Prototype - Horizon UI Chakra TS

A high-performance web-based Payment Gateway system designed to manage transaction flows between **Merchants**, **Admins**, and **Customers** using React, TypeScript, and Zustand.

---

## 🛠 Tech Stack
*   **Frontend Framework:** React 19 with TypeScript
*   **UI Library:** Chakra UI (v2.6.1)
*   **State Management:** Zustand (v5.0.12) with Persist Middleware
*   **Routing:** React Router DOM (v6.25.1)
*   **Styling:** Emotion & Framer Motion

---

## 🚀 Technical Development Lifecycle

The development of this application followed a structured iterative process to ensure data integrity and a smooth user experience:

1.  **UI Slicing & Layouting:** 
    Converted Horizon UI designs into functional components using Chakra UI. Established three core layout structures: `AuthLayout` (Login/Register), `AdminLayout` (Main Dashboard), and a clean Public Route for payment links.
    
2.  **Global State Configuration (Zustand):** 
    Initialized `useGlobalData.ts` and `useAuthStore.ts` using the `persist` middleware. This simulates a real-time database by storing transaction logs and user credentials directly in the browser's Local Storage.

3.  **Implementation of Role-Based Access Control (RBAC):** 
    Defined absolute roles: `'ADMIN'` and `'MERCHANT'`. Implemented strict route protection in `Main.tsx` using `<Navigate>` to ensure users are redirected if they attempt to access unauthorized dashboards.

4.  **Merchant Billing Logic:** 
    Developed the `createInvoice` function to handle merchant inputs, generating unique invoice IDs (e.g., `INV-XXXXXXXX`) and dynamic payment URLs.

5.  **Public Payment Gateway Route:** 
    Created a dynamic `/pay/:id` route using `useParams`. This allows the application to fetch specific invoice data from the global state and render it for unauthenticated customers.

6.  **Data Architecture Unification (Single Source of Truth):** 
    Resolved "Split-Brain" data issues by migrating all merchant-specific logic into `useGlobalData`. This ensures that Admin, Merchant, and Public views always reflect identical, real-time data.

7.  **3-Step Transaction State Machine:** 
    Refined the payment lifecycle into three logical stages:
    *   `PENDING`: Invoice generated, awaiting customer action.
    *   `WAITING`: Customer has initiated payment; transaction moved to Admin queue for verification.
    *   `PAID` / `FAILED`: Final resolution executed by the Admin.

8.  **UX & Accessibility Optimizations:** 
    *   Enhanced the Sign-In flow by wrapping inputs in a `<form>` element to support "Enter to Submit" functionality.
    *   Integrated the browser’s *Clipboard API* for a "One-Click Copy Link" feature on the merchant table.

---

## 💻 Getting Started

Follow these steps to run the project on your local machine:

### 1. Prerequisites
Ensure you have **Node.js** and **npm** installed.

### 2. Install Dependencies
Clone the repository and run the following command in your terminal:
```bash
npm install
```

### 3. Start Development Server
```bash
npm start
```

---

## Testing

This project includes **unit tests** (Jest + React Testing Library) and **performance tests** (k6).

---

### Unit Tests

Unit tests cover stores, layouts, and views. No browser or dev server needed.

#### Run all unit tests with coverage
```bash
npm run test:unit
```

#### Run by category
```bash
npm run test:unit:stores    # useAuthStore + useGlobalData (pure logic)
npm run test:unit:layouts   # AdminLayout + AuthLayout + AuthIllustration
npm run test:unit:views     # All view tests (auth, admin, merchant, public)
```

#### Run in watch mode (during development)
```bash
npm test
```

#### Test file locations

| Category | Path | Coverage |
|---|---|---|
| Stores | `src/__tests__/stores/useAuthStore.test.ts` | login, register, logout, admin seed |
| Stores | `src/__tests__/stores/useGlobalData.test.ts` | invoice lifecycle, payment state machine, refunds, top-ups |
| Layouts | `src/__tests__/layouts/admin.test.tsx` | AdminLayout render, path detection |
| Layouts | `src/__tests__/layouts/auth.test.tsx` | AuthLayout route filtering |
| Layouts | `src/__tests__/layouts/Default.test.tsx` | AuthIllustration children/props |
| Views/Auth | `src/__tests__/views/auth/signIn.test.tsx` | form render, email validation, login flow |
| Views/Auth | `src/__tests__/views/auth/register.test.tsx` | form render, validation, register flow |
| Views/Auth | `src/__tests__/views/auth/signOut.test.tsx` | render, logout call |
| Views/Admin | `src/__tests__/views/admin/adminPanel.test.tsx` | tabs, payment approval, refund, top-up, expire |
| Views/Merchant | `src/__tests__/views/merchant/dashboard.test.tsx` | balance display, tabs, invoice/top-up/refund modals |
| Views/Public | `src/__tests__/views/public/payment.test.tsx` | invalid link, PAID/EXPIRED states, checkout, timer |
| Views/Public | `src/__tests__/views/public/status.test.tsx` | all invoice statuses, MERCHANT vs guest buttons |

---

### Performance Tests (k6)

k6 load-tests the **HTTP delivery** of the SPA bundle from the dev server. Since auth is client-side (Zustand/localStorage), these tests measure page-load response times under concurrent virtual users.

#### Prerequisites

**Install k6:**
```bash
# macOS
brew install k6

# Windows (Chocolatey)
choco install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6
```

**Start the dev server first:**
```bash
npm start
# Wait until "Compiled successfully" appears, then run k6 in a separate terminal
```

#### Run individual tests
```bash
npm run test:k6:login      # Auth page load (ramp to 50 VUs)
npm run test:k6:payment    # Public payment page load (ramp to 50 VUs)
npm run test:k6:dashboard  # Dashboard load — merchant (40 VUs) + admin (10 VUs)
```

#### Run all k6 tests sequentially
```bash
npm run test:k6:all
```

#### Custom base URL
```bash
k6 run -e BASE_URL=http://localhost:3000 k6/login.js
```

#### k6 Script details

| Script | File | Scenario | Peak VUs | Thresholds |
|---|---|---|---|---|
| Login Page | `k6/login.js` | Auth + Register page load | 50 | p95 < 2000ms, error < 1% |
| Public Payment | `k6/public-payment.js` | `/pay/:token` + `/public-status/:id` | 50 | p95 < 1500ms, error < 0.5% |
| Dashboard | `k6/dashboard.js` | Merchant (40 VUs) + Admin (10 VUs) concurrent | 50 | p95 < 2000ms, error < 1% |

#### Understanding k6 output

```
scenarios: (100.00%) 1 scenario, 50 max VUs
...
http_req_duration............: avg=120ms  p(95)=380ms
http_req_failed..............: 0.00%
```

- **`p(95)`** — 95th percentile: 95% of users got responses faster than this
- **`http_req_failed`** — HTTP error rate (non-2xx/3xx responses)
- **`errors`** — Custom check failure rate

A test passes if all thresholds are green (`✓`). Red (`✗`) means the server is too slow or returning errors under load.

---

### Upgrade Path

| When | What to add |
|---|---|
| Real backend API added | Add k6 scenarios for POST `/login`, POST `/pay`, etc. |
| Need Core Web Vitals | Add Lighthouse CI (`@lhci/cli`) measuring TTI, LCP, CLS |
| Need true E2E browser testing | Use k6 browser module or Playwright for full user flow simulation |
