import { Logger } from '../src/logger/Logger';
import { LogLevel } from '../src/logger/LogLevel';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger();
  });

  test('should log info messages', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    logger.setLogLevel(LogLevel.INFO);
    logger.info('Info message');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Info message'));
    logSpy.mockRestore();
  });

  test('should log warn messages', () => {
    const logSpy = jest.spyOn(console, 'warn').mockImplementation();
    logger.setLogLevel(LogLevel.WARN);
    logger.warn('Warn message');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Warn message'));
    logSpy.mockRestore();
  });

  test('should log error messages', () => {
    const logSpy = jest.spyOn(console, 'error').mockImplementation();
    logger.setLogLevel(LogLevel.ERROR);
    logger.error('Error message');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Error message'));
    logSpy.mockRestore();
  });

  test('should not log messages below the set log level', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    logger.setLogLevel(LogLevel.ERROR);
    logger.info('This should not be logged');
    expect(logSpy).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });
});