import pino, { type redactOptions } from 'pino';

export type Fields = Record<string, unknown> & Partial<{ err: Error }>;

export type LogLevel = 'trace' | 'debug' | 'error' | 'fatal' | 'info' | 'warn';

export interface Logger {
  debug(message: string, fields?: Fields): void;
  error(message: string, fields?: Fields): void;
  info(message: string, fields?: Fields): void;
  warn(message: string, fields?: Fields): void;
}

export class ConsoleLogger {
  private readonly logger: pino.Logger;

  constructor(opts?: { redact?: redactOptions | string[]; level?: LogLevel }) {
    const options: pino.LoggerOptions = {
      timestamp: pino.stdTimeFunctions.isoTime,
      level: opts?.level || 'debug',
      redact: opts?.redact,
    };
    this.logger = pino(options);
  }

  private logFn(level: LogLevel, message: string, fields?: Fields): void {
    if (fields) {
      this.logger[level](fields, message);
      return;
    }

    this.logger[level](message);
    return;
  }

  public error(message: string, fields?: Fields): void {
    this.logFn('error', message, fields);
  }

  public debug(message: string, fields?: Fields): void {
    this.logFn('debug', message, fields);
  }

  public info(message: string, fields?: Fields): void {
    this.logFn('info', message, fields);
  }

  public warn(message: string, fields?: Fields): void {
    this.logFn('warn', message, fields);
  }

  public getInstance() {
    return this.logger;
  }
}
