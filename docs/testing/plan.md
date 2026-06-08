# Test Plan

## Unit Tests (Jest)
- Financial engine: snowball, avalanche, hybrid calculations
- Interest calculations: APR, amortization schedule
- Simulator: all 4 scenario types
- Input validation: Zod schemas

## Integration Tests
- Auth flow: signup → login → protected page
- Debt CRUD: create, read, update, delete
- Payment recording and balance updates

## E2E Tests (Playwright)
- User registration and login
- Add a debt and see it on dashboard
- Run a simulation
- Chat with AI coach
- Mobile layout verification

## Financial Accuracy Tests
- Snowball order correctness (smallest balance first)
- Avalanche order correctness (highest rate first)  
- Interest calculation vs known amortization tables
- Debt-free date calculation
- DTI ratio calculation
