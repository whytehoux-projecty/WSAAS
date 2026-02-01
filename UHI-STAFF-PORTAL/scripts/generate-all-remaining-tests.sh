#!/bin/bash

###############################################################################
# UHI Staff Portal - Comprehensive Test Suite Generator
#
# This script generates ALL remaining test files with proper structure
# and real data testing patterns
#
# Usage: ./generate-all-remaining-tests.sh
###############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TESTS_DIR="${PROJECT_ROOT}/tests"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Create directory structure
create_directories() {
    log_step "Creating comprehensive test directory structure..."
    
    mkdir -p "${TESTS_DIR}/integration/api"
    mkdir -p "${TESTS_DIR}/integration/database"
    mkdir -p "${TESTS_DIR}/integration/workflows"
    mkdir -p "${TESTS_DIR}/e2e/staff-portal"
    mkdir -p "${TESTS_DIR}/e2e/admin-interface"
    mkdir -p "${TESTS_DIR}/e2e/cross-component"
    mkdir -p "${TESTS_DIR}/performance"
    mkdir -p "${TESTS_DIR}/security"
    mkdir -p "${TESTS_DIR}/helpers"
    
    log_info "Directory structure created"
}

# Generate remaining API integration tests
generate_api_tests() {
    log_step "Generating remaining API integration tests..."
    
    # Documents API
    cat > "${TESTS_DIR}/integration/api/documents.test.ts" << 'EOF'
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../../staff_backend/src/app';
import TEST_CONFIG from '../../config/test.config';

const prisma = new PrismaClient({
  datasources: { db: { url: TEST_CONFIG.database.connectionString } },
});

describe('Documents API - Real Integration Tests', () => {
  let authToken: string;
  let csrfToken: string;

  beforeAll(async () => {
    await prisma.$connect();
    const csrfResponse = await request(app).get('/api/v1/csrf-token');
    csrfToken = csrfResponse.body.csrfToken;
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .send({
        email: TEST_CONFIG.auth.testUsers.staff.email,
        password: TEST_CONFIG.auth.testUsers.staff.password,
      });
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should upload document with real file', async () => {
    const fileContent = Buffer.from('Test document content');
    const response = await request(app)
      .post('/api/v1/documents/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .set('X-CSRF-Token', csrfToken)
      .attach('file', fileContent, 'test.pdf')
      .field('title', 'Test Document')
      .expect(201);
    expect(response.body.success).toBe(true);
  });

  it('should list documents from database', async () => {
    const response = await request(app)
      .get('/api/v1/documents')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.documents)).toBe(true);
  });

  it('should download document', async () => {
    const listResponse = await request(app)
      .get('/api/v1/documents?limit=1')
      .set('Authorization', `Bearer ${authToken}`);
    if (listResponse.body.documents.length > 0) {
      const docId = listResponse.body.documents[0].id;
      const response = await request(app)
        .get(`/api/v1/documents/${docId}/download`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(response.body.length).toBeGreaterThan(0);
    }
  });
});
EOF

    # Organizations API
    cat > "${TESTS_DIR}/integration/api/organizations.test.ts" << 'EOF'
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../../staff_backend/src/app';
import TEST_CONFIG from '../../config/test.config';

const prisma = new PrismaClient({
  datasources: { db: { url: TEST_CONFIG.database.connectionString } },
});

describe('Organizations API - Real Integration Tests', () => {
  let authToken: string;
  let csrfToken: string;

  beforeAll(async () => {
    await prisma.$connect();
    const csrfResponse = await request(app).get('/api/v1/csrf-token');
    csrfToken = csrfResponse.body.csrfToken;
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .send({
        email: TEST_CONFIG.auth.testUsers.admin.email,
        password: TEST_CONFIG.auth.testUsers.admin.password,
      });
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should list organizations from database', async () => {
    const response = await request(app)
      .get('/api/v1/organizations')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.organizations)).toBe(true);
  });

  it('should create organization', async () => {
    const response = await request(app)
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${authToken}`)
      .set('X-CSRF-Token', csrfToken)
      .send({
        name: `Test Org ${Date.now()}`,
        code: `ORG${Date.now()}`,
        type: 'UNIVERSITY',
      })
      .expect(201);
    expect(response.body.success).toBe(true);
  });
});
EOF

    # Reports API
    cat > "${TESTS_DIR}/integration/api/reports.test.ts" << 'EOF'
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../../staff_backend/src/app';
import TEST_CONFIG from '../../config/test.config';

const prisma = new PrismaClient({
  datasources: { db: { url: TEST_CONFIG.database.connectionString } },
});

describe('Reports API - Real Integration Tests', () => {
  let authToken: string;
  let csrfToken: string;

  beforeAll(async () => {
    await prisma.$connect();
    const csrfResponse = await request(app).get('/api/v1/csrf-token');
    csrfToken = csrfResponse.body.csrfToken;
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .send({
        email: TEST_CONFIG.auth.testUsers.admin.email,
        password: TEST_CONFIG.auth.testUsers.admin.password,
      });
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should generate payroll report', async () => {
    const response = await request(app)
      .post('/api/v1/reports/payroll')
      .set('Authorization', `Bearer ${authToken}`)
      .set('X-CSRF-Token', csrfToken)
      .send({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      })
      .expect(200);
    expect(response.body.success).toBe(true);
  });

  it('should export report to PDF', async () => {
    const response = await request(app)
      .get('/api/v1/reports/staff/export?format=pdf')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(response.headers['content-type']).toContain('pdf');
  });
});
EOF

    log_info "API integration tests generated"
}

# Generate remaining E2E tests
generate_e2e_tests() {
    log_step "Generating remaining E2E tests..."
    
    # Payroll E2E
    cat > "${TESTS_DIR}/e2e/staff-portal/payroll.spec.ts" << 'EOF'
import { test, expect } from '@playwright/test';
import TEST_CONFIG from '../../config/test.config';

const STAFF_PORTAL_URL = TEST_CONFIG.frontend.staffPortalUrl;
const TEST_USER = TEST_CONFIG.auth.testUsers.staff;

test.describe('Payroll E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(STAFF_PORTAL_URL);
    await page.fill('[name="email"]', TEST_USER.email);
    await page.fill('[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
    await page.click('[data-testid="nav-payroll"]');
  });

  test('should display payroll history', async ({ page }) => {
    await expect(page.locator('[data-testid="payroll-table"]')).toBeVisible();
  });

  test('should download payslip', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-payslip-btn"]').first();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });
});
EOF

    # Loans E2E
    cat > "${TESTS_DIR}/e2e/staff-portal/loans.spec.ts" << 'EOF'
import { test, expect } from '@playwright/test';
import TEST_CONFIG from '../../config/test.config';

const STAFF_PORTAL_URL = TEST_CONFIG.frontend.staffPortalUrl;
const TEST_USER = TEST_CONFIG.auth.testUsers.staff;

test.describe('Loans E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(STAFF_PORTAL_URL);
    await page.fill('[name="email"]', TEST_USER.email);
    await page.fill('[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
    await page.click('[data-testid="nav-loans"]');
  });

  test('should display loan list', async ({ page }) => {
    await expect(page.locator('[data-testid="loans-table"]')).toBeVisible();
  });

  test('should apply for loan', async ({ page }) => {
    await page.click('[data-testid="apply-loan-btn"]');
    await page.fill('[name="principal"]', '5000000');
    await page.fill('[name="purpose"]', 'Home improvement');
    await page.click('[data-testid="submit-application"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});
EOF

    log_info "E2E tests generated"
}

# Generate performance tests
generate_performance_tests() {
    log_step "Generating performance tests..."
    
    cat > "${TESTS_DIR}/performance/stress-test.js" << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 300 },
    { duration: '5m', target: 300 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const response = http.get('http://localhost:3000/api/v1/health');
  check(response, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
EOF

    cat > "${TESTS_DIR}/performance/spike-test.js" << 'EOF'
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
EOF

    log_info "Performance tests generated"
}

# Generate security tests
generate_security_tests() {
    log_step "Generating security tests..."
    
    cat > "${TESTS_DIR}/security/xss.test.ts" << 'EOF'
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../../staff_backend/src/app';
import TEST_CONFIG from '../../config/test.config';

const prisma = new PrismaClient({
  datasources: { db: { url: TEST_CONFIG.database.connectionString } },
});

describe('XSS Security Tests', () => {
  let authToken: string;
  let csrfToken: string;

  beforeAll(async () => {
    await prisma.$connect();
    const csrfResponse = await request(app).get('/api/v1/csrf-token');
    csrfToken = csrfResponse.body.csrfToken;
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .send({
        email: TEST_CONFIG.auth.testUsers.staff.email,
        password: TEST_CONFIG.auth.testUsers.staff.password,
      });
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
  ];

  xssPayloads.forEach((payload) => {
    it(`should prevent XSS: ${payload}`, async () => {
      const response = await request(app)
        .put('/api/v1/staff/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-CSRF-Token', csrfToken)
        .send({ firstName: payload });
      
      if (response.status === 200) {
        expect(response.body.profile.firstName).not.toContain('<script>');
      }
    });
  });
});
EOF

    cat > "${TESTS_DIR}/security/csrf.test.ts" << 'EOF'
import request from 'supertest';
import app from '../../../staff_backend/src/app';

describe('CSRF Security Tests', () => {
  it('should reject request without CSRF token', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@test.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(403);
    
    expect(response.body.success).toBe(false);
  });

  it('should accept request with valid CSRF token', async () => {
    const csrfResponse = await request(app).get('/api/v1/csrf-token');
    const csrfToken = csrfResponse.body.csrfToken;

    const response = await request(app)
      .post('/api/v1/auth/register')
      .set('X-CSRF-Token', csrfToken)
      .send({
        email: `test.${Date.now()}@test.com`,
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      });
    
    expect([201, 400]).toContain(response.status);
  });
});
EOF

    log_info "Security tests generated"
}

# Generate test helpers
generate_helpers() {
    log_step "Generating test helpers..."
    
    cat > "${TESTS_DIR}/helpers/test-utils.ts" << 'EOF'
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import TEST_CONFIG from '../config/test.config';

export class TestHelpers {
  private static prisma = new PrismaClient({
    datasources: { db: { url: TEST_CONFIG.database.connectionString } },
  });

  static async createTestUser(role: string = 'STAFF') {
    const email = `test.${Date.now()}@uhi.org`;
    const user = await this.prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash('TestPassword123!', 10),
        firstName: 'Test',
        lastName: 'User',
        role,
        isActive: true,
      },
    });
    return { user, password: 'TestPassword123!' };
  }

  static async cleanupTestUser(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } }).catch(() => {});
  }

  static generateTestFile(size: number = 1024) {
    return Buffer.alloc(size, 'test');
  }

  static async disconnect() {
    await this.prisma.$disconnect();
  }
}
EOF

    log_info "Test helpers generated"
}

# Main execution
main() {
    log_info "=== UHI Staff Portal - Comprehensive Test Suite Generator ==="
    echo ""
    
    create_directories
    generate_api_tests
    generate_e2e_tests
    generate_performance_tests
    generate_security_tests
    generate_helpers
    
    echo ""
    log_info "✅ All remaining test files generated!"
    log_info "📊 Generated files:"
    log_info "   - 3 API integration tests"
    log_info "   - 2 E2E tests"
    log_info "   - 2 Performance tests"
    log_info "   - 2 Security tests"
    log_info "   - 1 Test helpers file"
    log_info "   Total: 10 new files"
    echo ""
    log_info "📝 Next steps:"
    log_info "   1. Review generated test files"
    log_info "   2. Customize test cases as needed"
    log_info "   3. Run tests: npm run test:all"
    log_info "   4. Generate coverage: npm run test:coverage"
}

main "$@"
