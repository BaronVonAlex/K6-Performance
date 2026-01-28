# k6 + OpenAPI (Swagger) Setup Guide

This guide shows how to generate a k6-compatible API client from an OpenAPI/Swagger spec and run performance tests with k6.

## Prerequisites

- Node.js (v18+ recommended)
- k6 installed and available in PATH
- An OpenAPI / Swagger spec (`swagger.json` or `openapi.yaml`)

## Installation

Install the official Grafana generator as a dev dependency:

```bash
npm install --save-dev @grafana/openapi-to-k6
```

Or globally (optional):

```bash
npm install -g @grafana/openapi-to-k6
```

## Generate k6 API Client from OpenAPI

From the project root where your OpenAPI spec is located:

```bash
npx openapi-to-k6 vcSl.json ./k6
```

This generates a TypeScript API client for k6.

**Expected output:**
```
k6/
└─ vcSl.ts (generated API client)
```

⚠️ **Note:** The generator creates only the client, not a test script. You'll need to write your own test file.

## Create k6 Test Script

Create a new file: `k6/load.test.ts`

Example test using the generated client:

```typescript
import { sleep, check } from 'k6';
import { VcSlClient } from './vcSl.ts';

export const options = {
  stages: [
    { duration: '30s', target: 5 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

const client = new VcSlClient({
  baseUrl: 'https://api.example.com',
  commonRequestParameters: {
    headers: {
      Authorization: `Bearer ${__ENV.TOKEN}`,
    },
  },
});

export default function () {
  const res = client.getApiLeaderboard({ limit: 10 });
  check(res.response, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
```

## Important k6 Rules

- Always include file extensions in imports: `import { VcSlClient } from './vcSl.ts';`
- Do not edit the generated client file
- k6 does not support Node.js APIs (`fs`, `path`, etc.)

## Run the Test

### Linux / macOS

```bash
TOKEN=your_token_here k6 run k6/load.test.ts
```

### Windows (PowerShell)

```powershell
$env:TOKEN="your_token_here"
k6 run k6/load.test.ts
```

If your API has no authentication, remove the Authorization header.

## What This Setup Gives You

- ✅ Typed API calls generated from OpenAPI
- ✅ No manual request building
- ✅ Centralized API definitions
- ✅ Easy tagging and metrics in Grafana
- ✅ Production-grade k6 test structure

## Recommended Folder Structure

```
k6/
├─ vcSl.ts      # generated (do not edit)
└─ load.test.ts # your k6 test
```

## Next Steps (Optional)

- Switch to constant-arrival-rate for RPS-based testing
- Add tags per endpoint for Grafana dashboards
- Create multiple scenarios per user flow
- Export metrics to Prometheus / Grafana