"use strict";
/**
 * TBURN Audit Logger
 * Tamper-evident logging for security and compliance
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
exports.AuditLogger = void 0;
const fs = __importStar(require("fs"));
const crypto = __importStar(require("crypto"));
const crypto_utils_js_1 = require("./crypto-utils.js");
class AuditLogger {
    config;
    currentFile = '';
    currentSize = 0;
    lastHash = '';
    entryCount = 0;
    hmacKey;
    constructor(config = {}) {
        this.config = {
            logDir: config.logDir ?? './logs',
            maxFileSize: config.maxFileSize ?? 10 * 1024 * 1024,
            maxFiles: config.maxFiles ?? 100,
            enableConsole: config.enableConsole ?? true,
            enableFile: config.enableFile ?? true,
            enableIntegrity: config.enableIntegrity ?? true,
            hmacKey: config.hmacKey
        };
        this.hmacKey = config.hmacKey
            ? Buffer.from(config.hmacKey, 'hex')
            : crypto.randomBytes(32);
        if (this.config.enableFile) {
            this.ensureLogDir();
            this.rotateFile();
        }
    }
    ensureLogDir() {
        if (!fs.existsSync(this.config.logDir)) {
            fs.mkdirSync(this.config.logDir, { recursive: true });
        }
    }
    rotateFile() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        this.currentFile = `${this.config.logDir}/audit-${timestamp}.log`;
        this.currentSize = 0;
        this.lastHash = crypto.randomBytes(32).toString('hex');
        this.cleanOldFiles();
    }
    cleanOldFiles() {
        try {
            const files = fs.readdirSync(this.config.logDir)
                .filter(f => f.startsWith('audit-') && f.endsWith('.log'))
                .sort()
                .reverse();
            const toDelete = files.slice(this.config.maxFiles);
            for (const file of toDelete) {
                fs.unlinkSync(`${this.config.logDir}/${file}`);
            }
        }
        catch {
        }
    }
    log(level, category, action, details = {}, context = {}) {
        const entry = {
            id: crypto_utils_js_1.CryptoUtils.generateRequestId(),
            timestamp: Date.now(),
            level,
            category,
            action,
            ...context,
            details
        };
        if (this.config.enableIntegrity) {
            entry.previousHash = this.lastHash;
            entry.hash = this.computeHash(entry);
            this.lastHash = entry.hash;
        }
        this.entryCount++;
        if (this.config.enableConsole) {
            this.writeToConsole(entry);
        }
        if (this.config.enableFile) {
            this.writeToFile(entry);
        }
        return entry;
    }
    computeHash(entry) {
        const data = JSON.stringify({
            id: entry.id,
            timestamp: entry.timestamp,
            level: entry.level,
            category: entry.category,
            action: entry.action,
            validatorAddress: entry.validatorAddress,
            requestId: entry.requestId,
            ip: entry.ip,
            details: entry.details,
            previousHash: entry.previousHash
        });
        return crypto.createHmac('sha256', this.hmacKey)
            .update(data)
            .digest('hex');
    }
    writeToConsole(entry) {
        const levelColors = {
            INFO: '\x1b[36m',
            WARN: '\x1b[33m',
            ERROR: '\x1b[31m',
            SECURITY: '\x1b[35m'
        };
        const color = levelColors[entry.level] || '\x1b[0m';
        const reset = '\x1b[0m';
        const timestamp = new Date(entry.timestamp).toISOString();
        console.log(`${color}[${entry.level}]${reset} ${timestamp} [${entry.category}] ${entry.action}`, entry.validatorAddress ? `validator=${entry.validatorAddress}` : '', Object.keys(entry.details).length > 0 ? JSON.stringify(entry.details) : '');
    }
    writeToFile(entry) {
        const line = JSON.stringify(entry) + '\n';
        const lineSize = Buffer.byteLength(line);
        if (this.currentSize + lineSize > this.config.maxFileSize) {
            this.rotateFile();
        }
        try {
            fs.appendFileSync(this.currentFile, line);
            this.currentSize += lineSize;
        }
        catch (error) {
            console.error('[AuditLogger] Failed to write to file:', error);
        }
    }
    info(category, action, details, context) {
        return this.log('INFO', category, action, details, context);
    }
    warn(category, action, details, context) {
        return this.log('WARN', category, action, details, context);
    }
    error(category, action, details, context) {
        return this.log('ERROR', category, action, details, context);
    }
    security(category, action, details, context) {
        return this.log('SECURITY', category, action, details, context);
    }
    verifyIntegrity(entries) {
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            if (i > 0 && entry.previousHash !== entries[i - 1].hash) {
                return { valid: false, brokenAt: i };
            }
            const computedHash = this.computeHash({
                ...entry,
                hash: undefined
            });
            if (computedHash !== entry.hash) {
                return { valid: false, brokenAt: i };
            }
        }
        return { valid: true };
    }
    getStats() {
        return {
            entryCount: this.entryCount,
            currentFile: this.currentFile,
            currentSize: this.currentSize
        };
    }
}
exports.AuditLogger = AuditLogger;
//# sourceMappingURL=audit-logger.js.map