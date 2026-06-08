# Build Log

## 2026-06-08
- Initialized Next.js 16 project
- Discovered Prisma 7 breaking changes: url moved from schema.prisma to prisma.config.ts
- Discovered Next.js 16 uses refresh() from next/cache (not revalidatePath for simple refresh)
- Installed @prisma/adapter-better-sqlite3 for SQLite support
- Migration init complete, Prisma client generated at src/generated/prisma
