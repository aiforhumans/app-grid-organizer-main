# Complete Automated Logger System

This project implements a complete automated logging system that provides various logging functionalities. It supports multiple log levels, different transport mechanisms, and customizable formatting options.

## Features

- **Log Levels**: Supports multiple log levels including DEBUG, INFO, WARN, and ERROR.
- **Transports**: Logs can be sent to various transports such as console, file, and database.
- **Formatters**: Log messages can be formatted as plain text or JSON.
- **Configuration**: Easily configurable logger settings through a dedicated configuration file.

## Project Structure

```
automated-logger-system
├── src
│   ├── index.ts                # Entry point of the application
│   ├── logger
│   │   ├── Logger.ts           # Logger class for logging messages
│   │   ├── LogLevel.ts         # Enum for log levels
│   │   └── formatters
│   │       ├── JsonFormatter.ts # JSON formatter for log messages
│   │       └── TextFormatter.ts # Text formatter for log messages
│   ├── transports
│   │   ├── FileTransport.ts     # Transport for writing logs to a file
│   │   ├── ConsoleTransport.ts   # Transport for outputting logs to the console
│   │   └── DatabaseTransport.ts  # Transport for storing logs in a database
│   ├── config
│   │   └── LoggerConfig.ts      # Configuration settings for the logger
│   ├── utils
│   │   ├── FileManager.ts        # Utility functions for file operations
│   │   └── DateUtils.ts          # Utility functions for date formatting
│   └── types
│       └── index.ts             # Types and interfaces used in the logger system
├── tests
│   ├── logger.test.ts           # Unit tests for the Logger class
│   └── transports.test.ts       # Unit tests for transport classes
├── config
│   └── logger.config.json       # Configuration settings in JSON format
├── package.json                 # npm configuration file
├── tsconfig.json                # TypeScript configuration file
└── README.md                    # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd automated-logger-system
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To use the logger system, import the `Logger` class from the `logger` module and create an instance with the desired configuration. You can then log messages at different levels.

Example:
```typescript
import { Logger } from './src/logger/Logger';
import { LogLevel } from './src/logger/LogLevel';

const logger = new Logger(LogLevel.INFO);
logger.info('This is an info message');
logger.error('This is an error message');
```

## Running Tests

To run the tests, use the following command:
```
npm test
```

## License

This project is licensed under the MIT License.