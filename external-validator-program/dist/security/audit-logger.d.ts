/**
 * TBURN Audit Logger
 * Tamper-evident logging for security and compliance
 */
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
export declare class AuditLogger {
    private config;
    private currentFile;
    private currentSize;
    private lastHash;
    private entryCount;
    private hmacKey;
    constructor(config?: Partial<AuditLogConfig>);
    private ensureLogDir;
    private rotateFile;
    private cleanOldFiles;
    log(level: AuditEntry['level'], category: string, action: string, details?: Record<string, unknown>, context?: Partial<Pick<AuditEntry, 'validatorAddress' | 'requestId' | 'ip'>>): AuditEntry;
    private computeHash;
    private writeToConsole;
    private writeToFile;
    info(category: string, action: string, details?: Record<string, unknown>, context?: Partial<Pick<AuditEntry, 'validatorAddress' | 'requestId' | 'ip'>>): AuditEntry;
    warn(category: string, action: string, details?: Record<string, unknown>, context?: Partial<Pick<AuditEntry, 'validatorAddress' | 'requestId' | 'ip'>>): AuditEntry;
    error(category: string, action: string, details?: Record<string, unknown>, context?: Partial<Pick<AuditEntry, 'validatorAddress' | 'requestId' | 'ip'>>): AuditEntry;
    security(category: string, action: string, details?: Record<string, unknown>, context?: Partial<Pick<AuditEntry, 'validatorAddress' | 'requestId' | 'ip'>>): AuditEntry;
    verifyIntegrity(entries: AuditEntry[]): {
        valid: boolean;
        brokenAt?: number;
    };
    getStats(): {
        entryCount: number;
        currentFile: string;
        currentSize: number;
    };
}
//# sourceMappingURL=audit-logger.d.ts.map