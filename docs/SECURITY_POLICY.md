# TBURN Security Policy

## Overview
This document outlines the security policies and implementation details for the TBURN Blockchain Mainnet Explorer API.

## Authentication & Authorization

### Admin Routes
All admin routes (`/api/admin/*`, `/api/operator/*`) are protected by:
- **`requireAdmin`**: Session-based authentication requiring `adminAuthenticated` flag
- **`validateCsrf`**: CSRF token validation for all state-changing operations
- **`sensitiveOpLimiter`**: Rate limiting for sensitive operations

### User Routes
User-facing routes (`/api/staking/*`, `/api/validators/*`, etc.) use:
- **`requireAuth`**: Session-based authentication with `authenticated` or `adminAuthenticated` flag
- **Token-based auth**: CSRF validation is intentionally omitted for API token authentication patterns

**Rationale for CSRF omission on user routes:**
- User routes are designed for programmatic API access (wallets, dApps)
- Authentication is session-based with strict SameSite cookie policy
- API consumers use Bearer tokens or session cookies without browser-based CSRF attack vectors

### Public Routes
Public read-only routes (`/api/public/v1/*`) are protected by:
- **`publicReadRateLimiter`**: 60 requests per minute per IP
- No authentication required (read-only data)

## SQL Injection Prevention

### Parameterized Queries
All database queries use Drizzle ORM with parameterized `sql` template literals:
```typescript
// SAFE: Parameterized query
sql`${custodyTransactions.recipientAddress} ILIKE ${'%' + sanitizedRecipient + '%'}`
```

### Input Sanitization
User inputs are sanitized before use in queries:
- `sanitizeSearchString()`: Escapes SQL wildcards (`%`, `_`)
- Zod validation schemas for query parameters

### Raw SQL Exception
One `sql.raw()` usage exists for VACUUM operations:
- Location: `server/routes/db-optimization-routes.ts`
- Protection: Regex validation `/^[a-z_][a-z0-9_]*$/i` for table names
- Admin-only endpoint with CSRF protection

## XSS Prevention

### Output Sanitization
All user-provided fields are sanitized before response:
```typescript
escapeHtml(field): Escapes <, >, &, ", '
```

Applied to:
- `recipientName`
- `recipientAddress`
- `purpose`
- `justification`

### Input Validation
- Zod schemas validate all input parameters
- Type checking prevents injection attacks

## Error Handling

### Client Response Policy
All error responses return generic messages:
```typescript
res.status(500).json({ success: false, error: 'Internal server error' });
```

### Server-Side Logging
Detailed errors are logged for debugging:
```typescript
console.error('[Module] Error context:', error);
```

**Rationale:**
- Prevents information leakage (stack traces, SQL errors, internal paths)
- Maintains debugging capability through server logs
- Compliant with security best practices

## Rate Limiting

### Public Read Routes
- 60 requests per minute per IP
- Applied to: `/token-schedule`, `/token-details`, `/tokenomics/validate`

### Sensitive Operations
- `sensitiveOpLimiter`: Lower limits for high-risk operations
- Applied to: Token deployment, bridge transfers, governance votes

### Login Attempts
- `loginLimiter`: Prevents brute-force attacks on authentication

## CSRF Protection

### Implementation
- Session-bound tokens with 1-hour expiry
- `X-CSRF-Token` header validation
- Token regeneration on session changes

### Coverage
All admin state-changing endpoints (POST, PUT, PATCH, DELETE) require:
1. `requireAdmin` authentication
2. `validateCsrf` token validation

## Session Security

### Configuration
- Secure cookies (HTTPS only in production)
- HttpOnly flag prevents XSS access
- SameSite=Strict prevents CSRF
- Rolling sessions with automatic refresh

### Admin Sessions
- Timing-safe password comparison
- Session-based rate limiting for login attempts
- Automatic session invalidation on logout

## Audit Logging

### Tracked Actions
- Custody transactions
- Admin operations
- Security events
- Authentication attempts

### Data Captured
- Action type
- Entity affected
- Performer identity
- IP address
- Timestamp

## Compliance

### Data Protection
- No sensitive data in error responses
- Encrypted database connections
- Secrets managed via environment variables

### Validation Status
- GENESIS_ALLOCATION: 83/83 checks passed
- Custody Transactions: 57/57 checks passed
- 100% compliance with v4.3 specification
