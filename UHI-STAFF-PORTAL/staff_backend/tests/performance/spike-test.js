import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '1m', target: 500 },
    { duration: '10s', target: 10 },
  ],
};

export default function () {
  const response = http.get('http://localhost:3000/api/v1/health');
  check(response, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
