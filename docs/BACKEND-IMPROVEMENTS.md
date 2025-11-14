# Backend Architecture Improvements - Senior Backend Engineer

**Date**: 2025-11-14  
**Engineer**: Apex Senior Backend Engineer  
**Status**: Critical Issues Identified, Fixes Ready

---

## Critical Issues Identified

### Issue 1: Duplicate Database Connections ⚠️ CRITICAL
**Problem**: Two separate database instances exist:
- `src/lib/db/index.ts` (using neon-http)
- `src/server/db/index.ts` (using postgres-js)

**Impact**: 
- Potential connection pool issues
- Inconsistent schema usage
- Type safety problems
- Maintenance nightmare

**Fix**: Consolidate to single database instance in `lib/db/`

### Issue 2: Duplicate Auth Files
**Problem**: Two JWT auth implementations:
- `src/lib/auth/jwt.ts`
- `src/lib/auth.ts`

**Impact**: Code duplication, inconsistent behavior

**Fix**: Consolidate to single auth module

### Issue 3: Service in Wrong Location
**Problem**: `src/server/services/subscription.ts` exists alongside `src/lib/subscription/service.ts`

**Impact**: Violates architecture rules, confusion about which to use

**Fix**: Remove duplicate, ensure all services in `lib/`

### Issue 4: Duplicate Schema Definitions
**Problem**: Schemas exist in both:
- `src/lib/db/schema/`
- `src/server/db/schema/`

**Impact**: Schema drift, type inconsistencies

**Fix**: Consolidate all schemas to `lib/db/schema/`

### Issue 5: Type Safety in DB Proxy
**Problem**: `lib/db/index.ts` uses `any` in proxy

**Impact**: Type safety violation

**Fix**: Properly type the proxy

---

## Implementation Plan

### Phase 1: Database Consolidation (IMMEDIATE)

1. **Audit all database imports**
2. **Consolidate to `lib/db/`**
3. **Remove `server/db/`**
4. **Update all imports**

### Phase 2: Auth Consolidation

1. **Merge auth files**
2. **Create unified auth service**
3. **Update all imports**

### Phase 3: Service Consolidation

1. **Remove duplicate services**
2. **Ensure all services in `lib/`**
3. **Update imports**

### Phase 4: Schema Consolidation

1. **Move all schemas to `lib/db/schema/`**
2. **Remove `server/db/schema/`**
3. **Update imports**

---

## Ready-to-Apply Fixes

See implementation files below.
