import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';
import { Format } from 'logform';
import path from 'path';
import fs from 'fs';

const { combine, timestamp, printf, colorize, errors } = format;

// Type for metadata in log messages
interface LogMetadata {
  [key: string]: any;
}

// SafeStringify function
const safeStringify = (obj: any): string => {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return '[Circular]';
      }
      cache.add(value);
    }
    return value;
  });
};

// Ensure log directories exist
const logDir = './';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const environment = process.env.NODE_ENV || 'development';
console.log(`Initializing logger. Current environment: ${environment}`);

const customFormat: Format = printf(({ level, message, timestamp, ...metadata }: LogMetadata) => {
  let msg = `${timestamp} [${level}] ${message}`;
  if (Object.keys(metadata).length) {
    msg += ` ${safeStringify(metadata)}`;
  }
  return msg;
});

const Logger: WinstonLogger = createLogger({
  level: 'silly',
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
  },
  format: combine(
    colorize({ all: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    customFormat
  ),
  transports: [
    new transports.Console({ level: 'silly' }),
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat)
    }),
    new transports.File({
      filename: path.join(logDir, 'runtime.log'),
      level: 'silly',
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat)
    }),
    new transports.File({
      filename: path.join(logDir, 'combined.log'),
      level: 'silly',
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat)
    })
  ]
});

export { Logger, safeStringify };
