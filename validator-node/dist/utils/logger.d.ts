/**
 * TBURN Validator Node Logger
 * Enterprise-Grade Structured Logging
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export declare class Logger {
    private static instance;
    private logLevel;
    private logFormat;
    private logFile?;
    private fileStream?;
    private nodeId;
    private readonly levelPriority;
    private readonly levelColors;
    private constructor();
    static getInstance(): Logger;
    configure(options: {
        level?: LogLevel;
        format?: 'json' | 'text';
        logFile?: string;
        nodeId?: string;
    }): void;
    private shouldLog;
    private formatEntry;
    private log;
    debug(module: string, message: string, data?: Record<string, unknown>): void;
    info(module: string, message: string, data?: Record<string, unknown>): void;
    warn(module: string, message: string, data?: Record<string, unknown>): void;
    error(module: string, message: string, data?: Record<string, unknown>): void;
    close(): void;
}
export declare function createModuleLogger(module: string): {
    debug: (message: string, data?: Record<string, unknown>) => void;
    info: (message: string, data?: Record<string, unknown>) => void;
    warn: (message: string, data?: Record<string, unknown>) => void;
    error: (message: string, data?: Record<string, unknown>) => void;
};
export declare const logger: Logger;
//# sourceMappingURL=logger.d.ts.map