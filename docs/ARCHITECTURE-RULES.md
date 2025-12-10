# Architectural Rules & Standards

This document defines the architectural rules that all code must follow. These rules are enforced through:
- Code reviews
- Linting rules
- TypeScript compiler
- Automated checks

---

## Layer Rules

### Presentation Layer Rules

1. **Components**
   - ✅ Components must be pure (no side effects in render)
   - ✅ Use Server Components by default
   - ✅ Use `'use client'` only when necessary
   - ❌ No direct database access
   - ❌ No business logic in components

2. **Pages**
   - ✅ Pages should be thin (delegate to components/services)
   - ✅ Use tRPC for data fetching
   - ❌ No direct API calls (use tRPC)
   - ❌ No database queries in pages

3. **Hooks**
   - ✅ Hooks should be reusable
   - ✅ Hooks should handle client-side concerns only
   - ❌ No business logic in hooks

### API Layer Rules

1. **tRPC Routers**
   - ✅ All inputs must be validated with Zod
   - ✅ Use `protectedProcedure` for authenticated routes
   - ✅ Return typed responses
   - ❌ No business logic in routers (delegate to services)
   - ❌ No direct database queries (use services)

2. **REST API Routes**
   - ✅ Only for webhooks, health checks, external integrations
   - ✅ Validate all inputs
   - ✅ Return consistent error responses
   - ❌ No business logic in routes

### Service Layer Rules

1. **Services**
   - ✅ One service per domain/feature
   - ✅ Services are stateless (or explicitly stateful)
   - ✅ Services return typed results
   - ✅ Services can call other services
   - ❌ Services should not depend on Next.js APIs
   - ❌ No direct database queries (use repositories if needed)

2. **Service Structure**
   ```typescript
   // lib/[domain]/service.ts
   export class DomainService {
     static async method(params: Params): Promise<Result> {
       // Implementation
     }
   }
   ```

### Data Layer Rules

1. **Schema**
   - ✅ All schemas in `lib/db/schema/[domain].ts`
   - ✅ Use Drizzle ORM types
   - ✅ Define all relations
   - ❌ No raw SQL in schema files

2. **Queries**
   - ✅ Use Drizzle query builder (`db.select()`, `db.insert()`, etc.)
   - ✅ Use type inference (`$inferSelect`, `$inferInsert`)
   - ✅ All queries must be typed
   - ❌ No raw SQL unless necessary (use `sql` template tag)

---

## Type Safety Rules

1. **No `any` Types**
   - ❌ Never use `any`
   - ✅ Use `unknown` with type guards
   - ✅ Define proper types/interfaces

2. **Type Inference**
   - ✅ Use Drizzle type inference where possible
   - ✅ Use TypeScript inference for function returns
   - ✅ Explicitly type function parameters

3. **Type Guards**
   - ✅ Use type guards for runtime validation
   - ✅ Validate external data (API responses, user input)

---

## Naming Rules

### Files and Directories

- **Files**: `kebab-case.ts` or `PascalCase.tsx` (components)
- **Directories**: `kebab-case/`
- **Components**: `PascalCase.tsx`
- **Services**: `service.ts` or `[domain]-service.ts`
- **Types**: `types.ts` or co-located

### Code

- **Variables/Functions**: `camelCase`
- **Classes/Interfaces/Types**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Private members**: `private method` (TypeScript)

### Database

- **Tables**: `snake_case` (plural)
- **Columns**: `snake_case`
- **Indexes**: `[table]_[column]_idx`

---

## Error Handling Rules

1. **Error Classes**
   - ✅ Use custom error classes
   - ✅ Include error codes
   - ✅ Include context

2. **Error Responses**
   - ✅ Consistent error format
   - ✅ Log all errors
   - ✅ Don't expose internal errors to clients

3. **Error Handling**
   - ✅ Always handle errors
   - ✅ Use try/catch for async operations
   - ✅ Return typed error results

---

## Import Rules

1. **Import Order**
   ```typescript
   // 1. External dependencies
   import { NextRequest } from 'next/server';
   
   // 2. Internal dependencies (lib/)
   import { Service } from '@/lib/domain/service';
   
   // 3. Relative imports
   import { helper } from './helper';
   ```

2. **Import Paths**
   - ✅ Use `@/` alias for absolute imports
   - ✅ Use relative imports for same directory
   - ❌ No deep relative imports (`../../../../`)

3. **Import Types**
   - ✅ Use `import type` for type-only imports
   - ✅ Separate type imports from value imports

---

## Testing Rules

1. **Test Structure**
   - ✅ One test file per source file
   - ✅ Tests in `__tests__/` or `*.test.ts`
   - ✅ Group related tests with `describe`

2. **Test Coverage**
   - ✅ Test all public APIs
   - ✅ Test error cases
   - ✅ Test edge cases
   - ✅ Aim for 80%+ coverage

3. **Test Naming**
   - ✅ Use descriptive test names
   - ✅ Follow pattern: `should [expected behavior] when [condition]`

---

## Documentation Rules

1. **JSDoc**
   - ✅ All public APIs must have JSDoc
   - ✅ Document parameters (`@param`)
   - ✅ Document return values (`@returns`)
   - ✅ Add examples for complex functions

2. **Code Comments**
   - ✅ Explain "why", not "what"
   - ✅ Comment complex logic
   - ❌ Don't comment obvious code

3. **README**
   - ✅ Keep README updated
   - ✅ Document setup steps
   - ✅ Document architecture decisions

---

## Performance Rules

1. **Bundle Size**
   - ✅ Monitor bundle size
   - ✅ Use dynamic imports for large dependencies
   - ✅ Tree-shake unused code

2. **Database Queries**
   - ✅ Use indexes for queries
   - ✅ Avoid N+1 queries
   - ✅ Use pagination for large datasets

3. **API Responses**
   - ✅ Return only needed data
   - ✅ Use compression
   - ✅ Cache where appropriate

---

## Security Rules

1. **Authentication**
   - ✅ Always validate authentication
   - ✅ Use `protectedProcedure` for tRPC
   - ✅ Validate JWT tokens

2. **Input Validation**
   - ✅ Validate all inputs (Zod)
   - ✅ Sanitize user input
   - ✅ Use parameterized queries

3. **Secrets**
   - ✅ Never commit secrets
   - ✅ Use environment variables
   - ✅ Use secure storage for secrets

---

## Git Rules

1. **Commits**
   - ✅ Atomic commits (one logical change)
   - ✅ Descriptive commit messages
   - ✅ Follow conventional commits

2. **Branches**
   - ✅ Feature branches from `main`
   - ✅ Descriptive branch names
   - ✅ Keep branches up to date

3. **Pull Requests**
   - ✅ Small, focused PRs
   - ✅ Clear description
   - ✅ Link to issues
   - ✅ Request reviews

---

## Enforcement

These rules are enforced through:

1. **ESLint**: Code style, import order, etc.
2. **TypeScript**: Type safety, strict mode
3. **Pre-commit Hooks**: Linting, type checking
4. **CI/CD**: Automated checks on PRs
5. **Code Reviews**: Manual review of architecture

---

## Exceptions

Exceptions to these rules must be:
- Documented with rationale
- Approved by Lead Architect
- Reviewed periodically

---

**Last Updated**: 2025-11-14  
**Version**: 1.0
