/**
 * Base Error Classes for Backend
 * 
 * Provides structured error handling with error codes and context
 */

export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Not Found
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  
  // Database
  DATABASE_ERROR = 'DATABASE_ERROR',
  QUERY_ERROR = 'QUERY_ERROR',
  
  // External Services
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  STRIPE_ERROR = 'STRIPE_ERROR',
  PINECONE_ERROR = 'PINECONE_ERROR',
  
  // Business Logic
  SUBSCRIPTION_ERROR = 'SUBSCRIPTION_ERROR',
  LIMIT_EXCEEDED = 'LIMIT_EXCEEDED',
  TRIAL_EXPIRED = 'TRIAL_EXPIRED',
  
  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
}

export interface ErrorContext {
  [key: string]: unknown;
}

/**
 * Base error class for all application errors
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly context: ErrorContext;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number = 500,
    context: ErrorContext = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    this.timestamp = new Date();
    
    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Serialize error for API responses
   */
  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        context: this.context,
        timestamp: this.timestamp.toISOString(),
      },
    };
  }
}

/**
 * Authentication errors
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', context?: ErrorContext) {
    super(message, ErrorCode.UNAUTHORIZED, 401, context);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', context?: ErrorContext) {
    super(message, ErrorCode.FORBIDDEN, 403, context);
  }
}

export class InvalidTokenError extends AppError {
  constructor(message: string = 'Invalid token', context?: ErrorContext) {
    super(message, ErrorCode.INVALID_TOKEN, 401, context);
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, context);
  }
}

export class InvalidInputError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, ErrorCode.INVALID_INPUT, 400, context);
  }
}

/**
 * Not found errors
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id 
      ? `${resource} with id ${id} not found`
      : `${resource} not found`;
    super(message, ErrorCode.NOT_FOUND, 404, { resource, id });
  }
}

/**
 * Database errors
 */
export class DatabaseError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, ErrorCode.DATABASE_ERROR, 500, context);
  }
}

export class QueryError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, ErrorCode.QUERY_ERROR, 500, context);
  }
}

/**
 * External service errors
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, context?: ErrorContext) {
    super(
      `External service error (${service}): ${message}`,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      502,
      { service, ...context }
    );
  }
}

export class StripeError extends ExternalServiceError {
  constructor(message: string, context?: ErrorContext) {
    super('Stripe', message, context);
    this.code = ErrorCode.STRIPE_ERROR;
  }
}

export class PineconeError extends ExternalServiceError {
  constructor(message: string, context?: ErrorContext) {
    super('Pinecone', message, context);
    this.code = ErrorCode.PINECONE_ERROR;
  }
}

/**
 * Business logic errors
 */
export class SubscriptionError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, ErrorCode.SUBSCRIPTION_ERROR, 402, context);
  }
}

export class LimitExceededError extends AppError {
  constructor(feature: string, current: number, limit: number) {
    super(
      `${feature} limit exceeded (${current}/${limit})`,
      ErrorCode.LIMIT_EXCEEDED,
      429,
      { feature, current, limit }
    );
  }
}

export class TrialExpiredError extends AppError {
  constructor(userId: string) {
    super('Trial period has expired', ErrorCode.TRIAL_EXPIRED, 402, { userId });
  }
}

/**
 * System errors
 */
export class InternalError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, ErrorCode.INTERNAL_ERROR, 500, context);
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, ErrorCode.CONFIGURATION_ERROR, 500, context);
  }
}
