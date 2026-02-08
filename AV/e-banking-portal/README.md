# AURUM VAULT - E-Banking Portal

The secure customer banking portal for AURUM VAULT, allowing users to manage accounts, transactions, and wire transfers.

## 🏗️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Directory)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Testing**: Playwright (E2E) & Jest (Unit)
- **Status**: 🔄 **78% Complete** ([View Technical Review](./TECHNICAL_REVIEW_REPORT.md))

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- Backend API running (usually on port 3001)

### Installation

```bash
cd e-banking-portal
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:4000](http://localhost:4000) with your browser.

## 🔌 Integration

The E-Banking Portal relies heavily on the Backend API:

- **Authentication**: JWT tokens (stored in cookies/local storage)
- **Data**: All account and transaction data is fetched from the backend

### Environment Variables

See `.env.local`:

- `NEXT_PUBLIC_API_URL`: URL of the Backend API (e.g., `http://localhost:3001` or ngrok URL)
- `NEXT_PUBLIC_CORPORATE_URL`: URL of the Corporate Website
- `NEXT_PUBLIC_SESSION_TIMEOUT`: Session timeout in ms

## 🧪 Testing

### End-to-End Tests (Playwright)

```bash
cd e2e
npm run test:e2e
```

### Component Tests

```bash
npm test
```

## 📂 Project Structure

- `/app`: Next.js App Router structure
- `/components`: UI components (Dashboard, Transactions, etc.)
- `/hooks`: Custom React hooks for data fetching and logic
- `/services`: API service layer
- `/e2e`: Playwright E2E tests
