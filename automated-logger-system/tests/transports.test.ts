import { FileTransport } from '../src/transports/FileTransport';
import { ConsoleTransport } from '../src/transports/ConsoleTransport';
import { DatabaseTransport } from '../src/transports/DatabaseTransport';

describe('Transport Classes', () => {
  let fileTransport: FileTransport;
  let consoleTransport: ConsoleTransport;
  let databaseTransport: DatabaseTransport;

  beforeEach(() => {
    fileTransport = new FileTransport();
    consoleTransport = new ConsoleTransport();
    databaseTransport = new DatabaseTransport();
  });

  test('FileTransport should write logs to a file', () => {
    const logMessage = 'Test log message';
    const result = fileTransport.log(logMessage);
    expect(result).toBeTruthy(); // Assuming log method returns a boolean
  });

  test('ConsoleTransport should output logs to the console', () => {
    const logMessage = 'Test log message';
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleTransport.log(logMessage);
    expect(consoleSpy).toHaveBeenCalledWith(logMessage);
    consoleSpy.mockRestore();
  });

  test('DatabaseTransport should store logs in the database', () => {
    const logMessage = 'Test log message';
    const result = databaseTransport.log(logMessage);
    expect(result).toBeTruthy(); // Assuming log method returns a boolean
  });
});