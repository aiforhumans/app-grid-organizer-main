import fs from 'fs';
import path from 'path';

export class FileManager {
  static writeToFile(filePath: string, data: string): void {
    fs.appendFileSync(filePath, data + '\n', { encoding: 'utf8' });
  }

  static readFromFile(filePath: string): string {
    return fs.readFileSync(filePath, { encoding: 'utf8' });
  }

  static fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  static deleteFile(filePath: string): void {
    if (this.fileExists(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  static createDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}