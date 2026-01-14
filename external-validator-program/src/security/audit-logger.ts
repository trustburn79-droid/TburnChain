/**
 * TBURN Audit Logger
 * Tamper-evident logging for security and compliance
 */

import * as fs from 'fs';
import * as crypto from 'crypto';
import { CryptoUtils } from './crypto-utils.js';

export interface AuditLogConfig {
  logDir: string;
  maxFileSize: number;
  maxFiles: number;
  enableConsole: boolean;
  enableFile: boolean;
  enableIntegrity: boolean;
  hmacKey?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: number;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SECURITY';
  category: string;
  action: string;
  validatorAddress?: string;
  requestId?: string;
  ip?: string;
  details: Record<string, unknown>;
  previousHash?: string;
  hash?: string;
}

export class AuditLogger {
  private config: AuditLogConfig;
  private currentFile: string = '';
  private currentSize: number = 0;
  private lastHash: string = '';
  private entryCount: number = 0;
  private hmacKey: Buffer;

  constructor(config: Partial<AuditLogConfig> = {}) {
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

  private ensureLogDir(): void {
    if (!fs.existsSync(this.config.logDir)) {
      fs.mkdirSync(this.config.logDir, { recursive: true });
    }
  }

  private rotateFile(): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.currentFile = `${this.config.logDir}/audit-${timestamp}.log`;
    this.currentSize = 0;
    this.lastHash = crypto.randomBytes(32).toString('hex');

    this.cleanOldFiles();
  }

  private cleanOldFiles(): void {
    try {
      const files = fs.readdirSync(this.config.logDir)
        .filter(f => f.startsWith('audit-') && f.endsWith('.log'))
        .sort()
        .reverse();

      const toDelete = files.slice(this.config.maxFiles);
      for (const file of toDelete) {
        fs.unlinkSync(`${this.config.logDir}/${file}`);
      }
    } catch {
    }
  }

  log(
    level: AuditEntry['level'],
    category: string,
    action: string,
    details: Record<string, unknown> = {},
    context: Partial<Pick<AuditEntry, 'validatorAddress' | 'requestId' | 'ip'>> = {}
  ): AuditEntry {
    const entry: AuditEntry = {
      id: CryptoUtils.generateRequestId(),
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

  private computeHash(entry: AuditEntry): string {
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

  private writeToConsole(entry: AuditEntry): void {
    const levelColors: Record<string, string> = {
      INFO: '\x1b[36m',
      WARN: '\x1b[33m',
      ERROR: '\x1b[31m',
      SECURITY: '\x1b[35m'
    };

    const color = levelColors[entry.level] || '\x1b[0m';
    const reset = '\x1b[0m';
    const timestamp = new Date(entry.timestamp).toISOString();

    console.log(
      `${color}[${entry.level}]${reset} ${timestamp} [${entry.category}] ${entry.action}`,
      entry.validatorAddress ? `validator=${entry.validatorAddress}` : '',
      Object.keys(entry.details).length > 0 ? JSON.stringify(entry.details) : ''
    );
  }

  private writeToFile(entry: AuditEntry): void {
    const line = JSON.stringify(entry) + '\n';
    const lineSize = Buffer.byteLength(line);

    if (this.currentSize + lineSize > this.config.maxFileSize) {
      this.rotateFile();
    }

    try {
      fs.appendFileSync(this.currentFile, line);
      this.currentSize += lineSize;
    } catch (error) {
      console.error('[AuditLogger] Failed to write to file:', error);
    }
  }

  info(category: string, action: string, details?: Record<string, unknown>, context?: Partial<Pick<AuditEntry, 'validatorAddress' | 'requestId' | 'ip'>>): AuditEntry {
    return this.log('INFO', category, action, details, context);
  }

  warn(category: string, action: string, details?: Record<string, unknown>, context?: Partial<Pick<AuditEntry, 'validatorAddress' | 'requestId' | 'ip'>>): AuditEntry {
    return this.log('WARN', category, action, details, context);
  }

  error(category: string, action: string, details?: Record<string, unknown>, context?: Partial<Pick<AuditEntry, 'validatorAddress' | 'requestId' | 'ip'>>): AuditEntry {
    return this.log('ERROR', category, action, details, context);
  }

  security(category: string, action: string, details?: Record<string, unknown>, context?: Partial<Pick<AuditEntry, 'validatorAddress' | 'requestId' | 'ip'>>): AuditEntry {
    return this.log('SECURITY', category, action, details, context);
  }

  verifyIntegrity(entries: AuditEntry[]): { valid: boolean; brokenAt?: number } {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      
      if (i > 0 && entry.previousHash !== entries[i - 1].hash) {
        return { valid: false, brokenAt: i };
      }

      const computedHash = this.computeHash({
        ...entry,
        hash: undefined
      } as AuditEntry);

      if (computedHash !== entry.hash) {
        return { valid: false, brokenAt: i };
      }
    }

    return { valid: true };
  }

  getStats(): { entryCount: number; currentFile: string; currentSize: number } {
    return {
      entryCount: this.entryCount,
      currentFile: this.currentFile,
      currentSize: this.currentSize
    };
  }
}
