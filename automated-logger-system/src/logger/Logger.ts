import { LogLevel } from './LogLevel';
import { FileTransport } from '../transports/FileTransport';
import { ConsoleTransport } from '../transports/ConsoleTransport';
import { DatabaseTransport } from '../transports/DatabaseTransport';
import { LoggerConfig } from '../config/LoggerConfig';

export class Logger {
    private logLevel: LogLevel;
    private transports: Array<any>;

    constructor() {
        this.logLevel = LoggerConfig.defaultLogLevel;
        this.transports = this.initializeTransports(LoggerConfig.transports);
    }

    private initializeTransports(transportConfigs: any): Array<any> {
        const transports = [];
        if (transportConfigs.file) {
            transports.push(new FileTransport(transportConfigs.file));
        }
        if (transportConfigs.console) {
            transports.push(new ConsoleTransport());
        }
        if (transportConfigs.database) {
            transports.push(new DatabaseTransport(transportConfigs.database));
        }
        return transports;
    }

    public log(level: LogLevel, message: string): void {
        if (level >= this.logLevel) {
            const logEntry = this.formatLogEntry(level, message);
            this.transports.forEach(transport => transport.send(logEntry));
        }
    }

    public info(message: string): void {
        this.log(LogLevel.INFO, message);
    }

    public warn(message: string): void {
        this.log(LogLevel.WARN, message);
    }

    public error(message: string): void {
        this.log(LogLevel.ERROR, message);
    }

    private formatLogEntry(level: LogLevel, message: string): string {
        const timestamp = new Date().toISOString();
        return `${timestamp} [${LogLevel[level]}] ${message}`;
    }
}