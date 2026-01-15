/**
 * TBURN IP Whitelist Manager
 * Controls access based on IP address with subnet support
 */
export interface IPWhitelistConfig {
    enabled: boolean;
    allowedIPs: string[];
    allowedSubnets: string[];
    blockUnknown: boolean;
    auditLog: boolean;
}
export interface IPCheckResult {
    allowed: boolean;
    reason: string;
    matchedRule?: string;
}
export declare class IPWhitelistManager {
    private config;
    private parsedSubnets;
    private accessLog;
    constructor(config?: Partial<IPWhitelistConfig>);
    private parseSubnets;
    private parseSubnet;
    private ipToNumber;
    check(ip: string): IPCheckResult;
    private normalizeIP;
    private log;
    addIP(ip: string): void;
    removeIP(ip: string): void;
    addSubnet(subnet: string): void;
    getAccessLog(limit?: number): Array<{
        ip: string;
        allowed: boolean;
        timestamp: number;
    }>;
    getConfig(): IPWhitelistConfig;
}
//# sourceMappingURL=ip-whitelist.d.ts.map