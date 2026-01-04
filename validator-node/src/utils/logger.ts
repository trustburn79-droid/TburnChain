/**
 * TBURN Validator Node Logger
 * Enterprise-Grade Structured Logging
 */

import * as fs from 'fs';
import * as path from 'path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: Record<string, unknown>;
  nodeId?: string;
  traceId?: string;
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = 'info';
  private logFormat: 'json' | 'text' = 'json';
  private logFile?: string;
  private fileStream?: fs.WriteStream;
  private nodeId: string = '';

  private readonly levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  private readonly levelColors: Record<LogLevel, string> = {
    debug: '\x1b[36m',
    info: '\x1b[32m',
    warn: '\x1b[33m',
    error: '\x1b[31m',
  };

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  configure(options: {
    level?: LogLevel;
    format?: 'json' | 'text';
    logFile?: string;
    nodeId?: string;
  }): void {
    if (options.level) this.logLevel = options.level;
    if (options.format) this.logFormat = options.format;
    if (options.nodeId) this.nodeId = options.nodeId;
    
    if (options.logFile) {
      this.logFile = options.logFile;
      const logDir = path.dirname(options.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      this.fileStream = fs.createWriteStream(options.logFile, { flags: 'a' });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.logLevel];
  }

  private formatEntry(entry: LogEntry): string {
    if (this.logFormat === 'json') {
      return JSON.stringify(entry);
    }
    
    const reset = '\x1b[0m';
    const color = this.levelColors[entry.level];
    const levelStr = entry.level.toUpperCase().padEnd(5);
    const dataStr = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
    
    return `${entry.timestamp} ${color}[${levelStr}]${reset} [${entry.module}] ${entry.message}${dataStr}`;
  }

  private log(level: LogLevel, module: string, message: string, data?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data,
      nodeId: this.nodeId || undefined,
    };
    
    const formatted = this.formatEntry(entry);
    
    if (level === 'error') {
      console.error(formatted);
    } else {
      console.log(formatted);
    }
    
    if (this.fileStream) {
      this.fileStream.write(formatted + '\n');
    }
  }

  debug(module: string, message: string, data?: Record<string, unknown>): void {
    this.log('debug', module, message, data);
  }

  info(module: string, message: string, data?: Record<string, unknown>): void {
    this.log('info', module, message, data);
  }

  warn(module: string, message: string, data?: Record<string, unknown>): void {
    this.log('warn', module, message, data);
  }

  error(module: string, message: string, data?: Record<string, unknown>): void {
    this.log('error', module, message, data);
  }

  close(): void {
    if (this.fileStream) {
      this.fileStream.end();
    }
  }
}

export function createModuleLogger(module: string) {
  const logger = Logger.getInstance();
  return {
    debug: (message: string, data?: Record<string, unknown>) => logger.debug(module, message, data),
    info: (message: string, data?: Record<string, unknown>) => logger.info(module, message, data),
    warn: (message: string, data?: Record<string, unknown>) => logger.warn(module, message, data),
    error: (message: string, data?: Record<string, unknown>) => logger.error(module, message, data),
  };
}

export const logger = Logger.getInstance();
