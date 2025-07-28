import { Logger } from './logger/Logger';
import { LoggerConfig } from './config/LoggerConfig';

// Initialize logger with configuration
const logger = new Logger(LoggerConfig);

// Example usage
logger.info('Logger initialized successfully');
logger.warn('This is a warning message');
logger.error('This is an error message');