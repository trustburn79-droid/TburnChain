"use strict";
/**
 * TBURN Validator Node Logger
 * Enterprise-Grade Structured Logging
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = void 0;
exports.createModuleLogger = createModuleLogger;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class Logger {
    static instance;
    logLevel = 'info';
    logFormat = 'json';
    logFile;
    fileStream;
    nodeId = '';
    levelPriority = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
    };
    levelColors = {
        debug: '\x1b[36m',
        info: '\x1b[32m',
        warn: '\x1b[33m',
        error: '\x1b[31m',
    };
    constructor() { }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    configure(options) {
        if (options.level)
            this.logLevel = options.level;
        if (options.format)
            this.logFormat = options.format;
        if (options.nodeId)
            this.nodeId = options.nodeId;
        if (options.logFile) {
            this.logFile = options.logFile;
            const logDir = path.dirname(options.logFile);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            this.fileStream = fs.createWriteStream(options.logFile, { flags: 'a' });
        }
    }
    shouldLog(level) {
        return this.levelPriority[level] >= this.levelPriority[this.logLevel];
    }
    formatEntry(entry) {
        if (this.logFormat === 'json') {
            return JSON.stringify(entry);
        }
        const reset = '\x1b[0m';
        const color = this.levelColors[entry.level];
        const levelStr = entry.level.toUpperCase().padEnd(5);
        const dataStr = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
        return `${entry.timestamp} ${color}[${levelStr}]${reset} [${entry.module}] ${entry.message}${dataStr}`;
    }
    log(level, module, message, data) {
        if (!this.shouldLog(level))
            return;
        const entry = {
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
        }
        else {
            console.log(formatted);
        }
        if (this.fileStream) {
            this.fileStream.write(formatted + '\n');
        }
    }
    debug(module, message, data) {
        this.log('debug', module, message, data);
    }
    info(module, message, data) {
        this.log('info', module, message, data);
    }
    warn(module, message, data) {
        this.log('warn', module, message, data);
    }
    error(module, message, data) {
        this.log('error', module, message, data);
    }
    close() {
        if (this.fileStream) {
            this.fileStream.end();
        }
    }
}
exports.Logger = Logger;
function createModuleLogger(module) {
    const logger = Logger.getInstance();
    return {
        debug: (message, data) => logger.debug(module, message, data),
        info: (message, data) => logger.info(module, message, data),
        warn: (message, data) => logger.warn(module, message, data),
        error: (message, data) => logger.error(module, message, data),
    };
}
exports.logger = Logger.getInstance();
//# sourceMappingURL=logger.js.map