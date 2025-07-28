export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: any; // Additional properties can be added
}

export interface Transport {
  log(entry: LogEntry): void;
}

export interface LoggerConfig {
  level: LogLevel;
  transports: Transport[];
}