import { Transport } from '../types';
import { FileManager } from '../utils/FileManager';
import { LogLevel } from '../logger/LogLevel';

export class FileTransport implements Transport {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  log(level: LogLevel, message: string): void {
    const logEntry = `${new Date().toISOString()} [${level}]: ${message}\n`;
    FileManager.appendToFile(this.filePath, logEntry);
  }
}