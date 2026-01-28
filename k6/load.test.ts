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

const BASE_URL = 'https://localhost:7034';

const client = new VcSlClient({
  baseUrl: BASE_URL,
});

export default function () {
  const leaderboard = client.getApiLeaderboard({
    period: 1,
    limit: 10,
  });

  check(leaderboard.response, {
    'leaderboard status 200': (r) => r.status === 200,
  });

  const winrate = client.getApiWinrateGetWinrateForUser({
    userId: 18715508,
    year: 2025,
  });

  check(winrate.response, {
    'winrate status 200': (r) => r.status === 200,
  });

  sleep(1);
}
