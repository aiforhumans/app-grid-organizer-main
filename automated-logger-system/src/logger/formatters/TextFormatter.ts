class TextFormatter {
    format(message: string, level: string, timestamp: Date): string {
        return `${timestamp.toISOString()} [${level}] ${message}`;
    }
}

export default TextFormatter;