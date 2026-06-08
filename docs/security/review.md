# Security Review

## Authentication
- Passwords hashed with bcrypt (salt rounds: 12)
- Session tokens stored as httpOnly cookies
- NEXTAUTH_SECRET required in production

## Authorization
- All Server Actions verify session before executing
- Users can only access their own data (userId filter on all queries)
- No admin bypass paths

## Input Validation
- Zod schemas validate all user input server-side
- Prisma parameterized queries prevent SQL injection
- Financial values validated as positive numbers

## API Security
- Route handlers check auth session
- Rate limiting: TODO (implement with upstash/ratelimit for production)

## Secrets Management
- API keys in environment variables only
- .env in .gitignore
- ANTHROPIC_API_KEY never exposed to client

## XSS Protection
- React escapes all rendered values by default
- No dangerouslySetInnerHTML usage
- Content Security Policy: TODO for production

## Status: PARTIAL — rate limiting and CSP pending
