/**
 * Global Error Handler for Apex Agents
 * Centralized error handling for the entire application
 */

export enum ErrorType {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // Auth errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  AUTH_ERROR = 'AUTH_ERROR',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Server errors
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  
  // Client errors
  CLIENT_ERROR = 'CLIENT_ERROR',
  RUNTIME_ERROR = 'RUNTIME_ERROR',
  
  // Feature-specific errors
  VOICE_ERROR = 'VOICE_ERROR',
  PATCH_ERROR = 'PATCH_ERROR',
  
  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export enum ErrorSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  code?: string;
  statusCode?: number;
  originalError?: Error;
  context?: Record<string, any>;
  timestamp: Date;
  recoverable: boolean;
  retryable: boolean;
}

/**
 * Error messages for different error types
 */
const ERROR_MESSAGES: Record<ErrorType, { title: string; message: string; severity: ErrorSeverity }> = {
  [ErrorType.NETWORK_ERROR]: {
    title: 'Network Error',
    message: 'Unable to connect to the server. Please check your internet connection.',
    severity: ErrorSeverity.ERROR,
  },
  [ErrorType.API_ERROR]: {
    title: 'API Error',
    message: 'An error occurred while communicating with the server.',
    severity: ErrorSeverity.ERROR,
  },
  [ErrorType.TIMEOUT_ERROR]: {
    title: 'Request Timeout',
    message: 'The request took too long. Please try again.',
    severity: ErrorSeverity.WARNING,
  },
  [ErrorType.UNAUTHORIZED]: {
    title: 'Unauthorized',
    message: 'You are not authorized to perform this action. Please log in.',
    severity: ErrorSeverity.ERROR,
  },
  [ErrorType.FORBIDDEN]: {
    title: 'Access Denied',
    message: 'You do not have permission to access this resource.',
    severity: ErrorSeverity.ERROR,
  },
  [ErrorType.AUTH_ERROR]: {
    title: 'Authentication Error',
    message: 'Authentication failed. Please try logging in again.',
    severity: ErrorSeverity.ERROR,
  },
  [ErrorType.VALIDATION_ERROR]: {
    title: 'Validation Error',
    message: 'Please check your input and try again.',
    severity: ErrorSeverity.WARNING,
  },
  [ErrorType.INVALID_INPUT]: {
    title: 'Invalid Input',
    message: 'The input you provided is invalid.',
    severity: ErrorSeverity.WARNING,
  },
  [ErrorType.SERVER_ERROR]: {
    title: 'Server Error',
    message: 'An error occurred on the server. Please try again later.',
    severity: ErrorSeverity.CRITICAL,
  },
  [ErrorType.NOT_FOUND]: {
    title: 'Not Found',
    message: 'The requested resource was not found.',
    severity: ErrorSeverity.WARNING,
  },
  [ErrorType.CONFLICT]: {
    title: 'Conflict',
    message: 'The operation could not be completed due to a conflict.',
    severity: ErrorSeverity.WARNING,
  },
  [ErrorType.CLIENT_ERROR]: {
    title: 'Client Error',
    message: 'An error occurred in the application.',
    severity: ErrorSeverity.ERROR,
  },
  [ErrorType.RUNTIME_ERROR]: {
    title: 'Runtime Error',
    message: 'An unexpected error occurred. Please refresh the page.',
    severity: ErrorSeverity.ERROR,
  },
  [ErrorType.VOICE_ERROR]: {
    title: 'Voice Feature Error',
    message: 'An error occurred with the voice feature.',
    severity: ErrorSeverity.WARNING,
  },
  [ErrorType.PATCH_ERROR]: {
    title: 'Patch Error',
    message: 'An error occurred while processing the patch.',
    severity: ErrorSeverity.ERROR,
  },
  [ErrorType.UNKNOWN_ERROR]: {
    title: 'Unknown Error',
    message: 'An unexpected error occurred. Please try again.',
    severity: ErrorSeverity.ERROR,
  },
};

/**
 * Create an application error
 */
export function createAppError(
  type: ErrorType,
  userMessage?: string,
  options?: {
    code?: string;
    statusCode?: number;
    originalError?: Error;
    context?: Record<string, any>;
    recoverable?: boolean;
    retryable?: boolean;
  }
): AppError {
  const errorInfo = ERROR_MESSAGES[type] || ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR];
  
  return {
    type,
    severity: errorInfo.severity,
    message: options?.originalError?.message || errorInfo.message,
    userMessage: userMessage || errorInfo.message,
    code: options?.code,
    statusCode: options?.statusCode,
    originalError: options?.originalError,
    context: options?.context,
    timestamp: new Date(),
    recoverable: options?.recoverable !== false,
    retryable: options?.retryable !== false,
  };
}

/**
 * Handle HTTP errors
 */
export function handleHttpError(statusCode: number, data?: any): AppError {
  let type: ErrorType;
  let recoverable = true;
  let retryable = false;

  switch (statusCode) {
    case 400:
      type = ErrorType.VALIDATION_ERROR;
      recoverable = true;
      retryable = false;
      break;
    case 401:
      type = ErrorType.UNAUTHORIZED;
      recoverable = true;
      retryable = false;
      break;
    case 403:
      type = ErrorType.FORBIDDEN;
      recoverable = false;
      retryable = false;
      break;
    case 404:
      type = ErrorType.NOT_FOUND;
      recoverable = true;
      retryable = false;
      break;
    case 409:
      type = ErrorType.CONFLICT;
      recoverable = true;
      retryable = true;
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      type = ErrorType.SERVER_ERROR;
      recoverable = true;
      retryable = true;
      break;
    case 408:
      type = ErrorType.TIMEOUT_ERROR;
      recoverable = true;
      retryable = true;
      break;
    default:
      type = ErrorType.API_ERROR;
      recoverable = true;
      retryable = statusCode >= 500;
  }

  return createAppError(type, undefined, {
    statusCode,
    recoverable,
    retryable,
    context: { response: data },
  });
}

/**
 * Handle network errors
 */
export function handleNetworkError(error: Error): AppError {
  const isNetworkError = error.message.includes('fetch') || error.message.includes('network');
  
  return createAppError(
    isNetworkError ? ErrorType.NETWORK_ERROR : ErrorType.API_ERROR,
    undefined,
    {
      originalError: error,
      recoverable: true,
      retryable: true,
    }
  );
}

/**
 * Handle validation errors
 */
export function handleValidationError(message: string, fields?: Record<string, string>): AppError {
  return createAppError(ErrorType.VALIDATION_ERROR, message, {
    context: { fields },
    recoverable: true,
    retryable: false,
  });
}

/**
 * Log error with context
 */
export function logError(error: AppError, context?: string): void {
  const timestamp = error.timestamp.toISOString();
  const contextStr = context ? ` [${context}]` : '';
  
  const logLevel = error.severity === ErrorSeverity.CRITICAL ? 'error' : 'warn';
  
  console[logLevel as 'error' | 'warn'](
    `[${error.severity}] ${timestamp}${contextStr} - ${error.type}`,
    {
      message: error.message,
      userMessage: error.userMessage,
      code: error.code,
      statusCode: error.statusCode,
      recoverable: error.recoverable,
      retryable: error.retryable,
      context: error.context,
      originalError: error.originalError,
    }
  );

  // Could send to error tracking service here
  // e.g., Sentry, LogRocket, etc.
  if (error.severity === ErrorSeverity.CRITICAL) {
    // Send to error tracking service
    // captureException(error);
  }
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: AppError): boolean {
  return error.recoverable;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: AppError): boolean {
  return error.retryable;
}

/**
 * Get user-friendly error message
 */
export function getUserErrorMessage(error: AppError): string {
  return error.userMessage;
}

/**
 * Format error for display
 */
export function formatErrorForDisplay(error: AppError): { title: string; message: string; severity: ErrorSeverity } {
  const errorInfo = ERROR_MESSAGES[error.type] || ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR];
  return {
    title: errorInfo.title,
    message: error.userMessage || errorInfo.message,
    severity: error.severity,
  };
}

/**
 * Global error handler
 */
export function handleGlobalError(error: unknown, context?: string): AppError {
  let appError: AppError;

  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes('fetch') || error.message.includes('network')) {
      appError = handleNetworkError(error);
    } else if (error.message.includes('timeout')) {
      appError = createAppError(ErrorType.TIMEOUT_ERROR, undefined, {
        originalError: error,
        recoverable: true,
        retryable: true,
      });
    } else {
      appError = createAppError(ErrorType.RUNTIME_ERROR, undefined, {
        originalError: error,
        recoverable: true,
        retryable: false,
      });
    }
  } else if (typeof error === 'string') {
    appError = createAppError(ErrorType.UNKNOWN_ERROR, error, {
      recoverable: true,
      retryable: false,
    });
  } else {
    appError = createAppError(ErrorType.UNKNOWN_ERROR, undefined, {
      context: { error },
      recoverable: true,
      retryable: false,
    });
  }

  logError(appError, context);
  return appError;
}

/**
 * Setup global error handlers
 */
export function setupGlobalErrorHandlers(): void {
  // Handle uncaught errors
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      handleGlobalError(event.error, 'uncaught-error');
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      handleGlobalError(event.reason, 'unhandled-rejection');
    });
  }
}
