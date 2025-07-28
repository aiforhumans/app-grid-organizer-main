import { Transport } from '../types';

export class ConsoleTransport implements Transport {
  log(level: string, message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
  }
}