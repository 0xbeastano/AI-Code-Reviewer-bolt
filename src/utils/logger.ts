export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel = LogLevel.INFO;
  private isDevelopment = import.meta.env.DEV;

  constructor() {
    // Set log level based on environment
    if (this.isDevelopment) {
      this.level = LogLevel.DEBUG;
    } else {
      this.level = LogLevel.WARN;
    }
  }

  setLevel(level: LogLevel) {
    this.level = level;
  }

  private log(level: LogLevel, message: string, ...args: any[]) {
    if (level < this.level) return;

    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const prefix = `[${timestamp}] [${levelName}]`;

    switch (level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(prefix, message, ...args);
        }
        break;
      case LogLevel.INFO:
        if (this.isDevelopment) {
          console.info(prefix, message, ...args);
        }
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, ...args);
        // In production, consider sending to monitoring service
        this.sendToMonitoring('warn', message, args);
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, ...args);
        // In production, send to error tracking service
        this.sendToMonitoring('error', message, args);
        break;
    }
  }

  private sendToMonitoring(level: string, message: string, args: any[]) {
    // Only send to monitoring in production
    if (!this.isDevelopment) {
      // Here you would integrate with services like Sentry, LogRocket, etc.
      // For now, we'll just structure the data for future integration
      const logData = {
        level,
        message,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        args: args.length > 0 ? args : undefined,
      };
      
      // TODO: Integrate with monitoring service
      // Example: Sentry.captureMessage(message, level as any, { extra: logData });
    }
  }

  debug(message: string, ...args: any[]) {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log(LogLevel.INFO, message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log(LogLevel.WARN, message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.log(LogLevel.ERROR, message, ...args);
  }

  // Method for API errors with structured data
  apiError(endpoint: string, error: any, context?: any) {
    const errorInfo = {
      endpoint,
      status: error?.status || error?.response?.status,
      message: error?.message || 'Unknown API error',
      context,
    };
    this.error('API Error', errorInfo);
  }

  // Method for performance monitoring
  performance(operation: string, duration: number, metadata?: any) {
    if (this.isDevelopment) {
      this.info(`Performance: ${operation} took ${duration}ms`, metadata);
    }
  }
}

// Create and export singleton instance
export const logger = new Logger();

// Export convenience methods
export const log = {
  debug: (message: string, ...args: any[]) => logger.debug(message, ...args),
  info: (message: string, ...args: any[]) => logger.info(message, ...args),
  warn: (message: string, ...args: any[]) => logger.warn(message, ...args),
  error: (message: string, ...args: any[]) => logger.error(message, ...args),
  apiError: (endpoint: string, error: any, context?: any) => logger.apiError(endpoint, error, context),
  performance: (operation: string, duration: number, metadata?: any) => logger.performance(operation, duration, metadata),
};