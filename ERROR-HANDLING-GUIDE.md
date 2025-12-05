# Global Error Handling Guide

## Overview

Apex Agents implements comprehensive error handling across the entire application, including:
- Global error handlers for uncaught exceptions
- API error handling with retry logic
- React error boundaries
- User-friendly error messages
- Error logging and tracking

## Architecture

### Core Components

#### 1. Error Handler (`src/lib/errorHandler.ts`)
Central error handling utility with:
- Error type definitions
- Error creation and formatting
- HTTP error handling
- Network error handling
- Global error setup

#### 2. Error Store (`src/lib/stores/errorStore.ts`)
Zustand store for managing error state:
- Error list management
- Current error tracking
- Error filtering and retrieval

#### 3. Error Display (`src/components/GlobalErrorDisplay.tsx`)
React component for displaying errors:
- Auto-dismissing notifications
- Severity-based styling
- Error history
- User-friendly messages

#### 4. Error Boundary (`src/components/ErrorBoundary.tsx`)
React error boundary for catching component errors:
- Component error catching
- Fallback UI
- Error logging
- Reset functionality

#### 5. API Interceptor (`src/lib/api/errorInterceptor.ts`)
Fetch wrapper with error handling:
- HTTP error handling
- Retry logic
- API client factory

## Error Types

### Application Errors

```typescript
enum ErrorType {
  // Network errors
  NETWORK_ERROR
  API_ERROR
  TIMEOUT_ERROR
  
  // Auth errors
  UNAUTHORIZED
  FORBIDDEN
  AUTH_ERROR
  
  // Validation errors
  VALIDATION_ERROR
  INVALID_INPUT
  
  // Server errors
  SERVER_ERROR
  NOT_FOUND
  CONFLICT
  
  // Client errors
  CLIENT_ERROR
  RUNTIME_ERROR
  
  // Feature-specific errors
  VOICE_ERROR
  PATCH_ERROR
  
  // Unknown
  UNKNOWN_ERROR
}
```

### Error Severity

```typescript
enum ErrorSeverity {
  INFO        // Informational
  WARNING     // Warning (recoverable)
  ERROR       // Error (recoverable)
  CRITICAL    // Critical (may require action)
}
```

## Usage

### Creating Errors

```typescript
import { createAppError, ErrorType } from '@/lib/errorHandler';

// Simple error
const error = createAppError(ErrorType.VALIDATION_ERROR);

// Error with custom message
const error = createAppError(
  ErrorType.VALIDATION_ERROR,
  'Please enter a valid email address'
);

// Error with full options
const error = createAppError(
  ErrorType.API_ERROR,
  'Failed to fetch data',
  {
    statusCode: 500,
    originalError: new Error('Server error'),
    context: { endpoint: '/api/data' },
    recoverable: true,
    retryable: true,
  }
);
```

### Adding Errors to Store

```typescript
import { useErrorStore } from '@/lib/stores/errorStore';

function MyComponent() {
  const { addError, clearError } = useErrorStore();
  
  const handleError = (error: AppError) => {
    addError(error);
    // Error auto-dismisses after 5 seconds if recoverable
  };
  
  return (
    <button onClick={() => clearError()}>
      Dismiss Error
    </button>
  );
}
```

### Handling API Errors

```typescript
import { fetchWithErrorHandling, apiCallWithRetry } from '@/lib/api/errorInterceptor';

// Simple fetch with error handling
async function fetchData() {
  const response = await fetchWithErrorHandling('/api/data');
  return response.json();
}

// API call with retry logic
async function fetchDataWithRetry() {
  return apiCallWithRetry(
    () => fetch('/api/data').then(r => r.json()),
    {
      maxRetries: 3,
      retryDelay: 1000,
      onRetry: (attempt, error) => {
        console.log(`Retry attempt ${attempt}: ${error.message}`);
      },
    }
  );
}

// Using API client
import { createApiClient } from '@/lib/api/errorInterceptor';

const api = createApiClient('/api');
const data = await api.get('/data');
const result = await api.post('/data', { name: 'test' });
```

### Using Error Boundary

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Error caught:', error);
        console.error('Component stack:', errorInfo.componentStack);
      }}
    >
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### Handling HTTP Errors

```typescript
import { handleHttpError } from '@/lib/errorHandler';

async function fetchData() {
  const response = await fetch('/api/data');
  
  if (!response.ok) {
    const data = await response.json();
    const error = handleHttpError(response.status, data);
    // Handle error
  }
}
```

### Logging Errors

```typescript
import { logError } from '@/lib/errorHandler';

try {
  // Some operation
} catch (error) {
  const appError = createAppError(ErrorType.RUNTIME_ERROR, undefined, {
    originalError: error as Error,
  });
  logError(appError, 'my-operation');
}
```

## Global Error Display

The `GlobalErrorDisplay` component should be added to your root layout:

```typescript
import { GlobalErrorDisplay } from '@/components/GlobalErrorDisplay';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GlobalErrorDisplay />
        {children}
      </body>
    </html>
  );
}
```

## Error Handling Flow

```
1. Error Occurs
   ↓
2. Error Handler Catches It
   ├─ Global error handler (uncaught)
   ├─ Error boundary (React errors)
   ├─ API interceptor (fetch errors)
   └─ Try-catch (explicit)
   ↓
3. Error Logged
   ├─ Console (dev)
   ├─ Error tracking service (prod)
   └─ Error store (UI)
   ↓
4. Error Displayed
   ├─ Global error notification
   ├─ Component error boundary
   └─ Form validation errors
   ↓
5. User Action
   ├─ Retry (if retryable)
   ├─ Dismiss (if recoverable)
   └─ Refresh (if critical)
```

## Best Practices

### 1. Always Provide User Messages
```typescript
// ❌ Bad
const error = createAppError(ErrorType.API_ERROR);

// ✅ Good
const error = createAppError(
  ErrorType.API_ERROR,
  'Failed to load data. Please try again.'
);
```

### 2. Use Specific Error Types
```typescript
// ❌ Bad
const error = createAppError(ErrorType.UNKNOWN_ERROR);

// ✅ Good
const error = createAppError(ErrorType.VALIDATION_ERROR);
```

### 3. Include Context
```typescript
// ❌ Bad
const error = createAppError(ErrorType.API_ERROR);

// ✅ Good
const error = createAppError(ErrorType.API_ERROR, undefined, {
  context: { endpoint: '/api/data', method: 'GET' },
});
```

### 4. Handle Errors at Appropriate Levels
```typescript
// Component level
try {
  const data = await fetchData();
} catch (error) {
  addError(error);
}

// Global level
setupGlobalErrorHandlers(); // Catches uncaught errors
```

### 5. Use Retry Logic for Transient Errors
```typescript
await apiCallWithRetry(
  () => fetchData(),
  { maxRetries: 3 }
);
```

## Testing Error Handling

### Test Error Boundary
```typescript
function ErrorThrowingComponent() {
  throw new Error('Test error');
}

<ErrorBoundary>
  <ErrorThrowingComponent />
</ErrorBoundary>
```

### Test API Errors
```typescript
// Mock fetch to return error
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: false,
    status: 500,
    json: () => Promise.resolve({ error: 'Server error' }),
  })
);

await fetchWithErrorHandling('/api/data');
```

### Test Error Store
```typescript
const { addError, getErrorCount } = useErrorStore.getState();
const error = createAppError(ErrorType.VALIDATION_ERROR);
addError(error);
expect(getErrorCount()).toBe(1);
```

## Integration with External Services

### Sentry Integration (Example)
```typescript
import * as Sentry from "@sentry/react";

export function logError(error: AppError, context?: string): void {
  // ... existing logging ...
  
  if (error.severity === ErrorSeverity.CRITICAL) {
    Sentry.captureException(error.originalError, {
      tags: { errorType: error.type },
      contexts: { error: error.context },
    });
  }
}
```

### LogRocket Integration (Example)
```typescript
import LogRocket from 'logrocket';

export function logError(error: AppError, context?: string): void {
  // ... existing logging ...
  
  LogRocket.captureException(error.originalError, {
    tags: { errorType: error.type },
    extra: error.context,
  });
}
```

## Troubleshooting

### Errors Not Displaying
1. Check `GlobalErrorDisplay` is in root layout
2. Verify error store is initialized
3. Check browser console for errors

### Errors Not Being Caught
1. Ensure error boundary wraps component
2. Check fetch is using error interceptor
3. Verify global handlers are initialized

### Retry Logic Not Working
1. Check error is marked as `retryable`
2. Verify `apiCallWithRetry` is being used
3. Check retry delay is appropriate

## Performance Considerations

- Error store keeps max 50 errors (prevents memory leak)
- Recoverable errors auto-dismiss after 5 seconds
- Error logging is async (doesn't block UI)
- Error boundary doesn't re-render unnecessarily

## Security Considerations

- Sensitive data is not logged in user messages
- Error details are only shown in development
- Stack traces are not exposed to users
- Error tracking service should be secure

## Future Enhancements

1. **Error Analytics** - Track error patterns
2. **Smart Retry** - Exponential backoff
3. **Offline Support** - Queue errors when offline
4. **Error Recovery** - Auto-recovery strategies
5. **User Feedback** - Collect error context from users

---

**Last Updated**: December 4, 2024
**Version**: 1.0.0
