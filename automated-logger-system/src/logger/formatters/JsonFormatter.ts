class JsonFormatter {
  format(logLevel: string, message: string, timestamp: Date): string {
    const logEntry = {
      level: logLevel,
      message: message,
      timestamp: timestamp.toISOString(),
    };
    return JSON.stringify(logEntry);
  }
}

export default JsonFormatter;