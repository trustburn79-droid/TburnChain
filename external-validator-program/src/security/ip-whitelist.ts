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

export class IPWhitelistManager {
  private config: IPWhitelistConfig;
  private parsedSubnets: Array<{ network: number; mask: number; original: string }> = [];
  private accessLog: Array<{ ip: string; allowed: boolean; timestamp: number }> = [];

  constructor(config: Partial<IPWhitelistConfig> = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      allowedIPs: config.allowedIPs ?? ['127.0.0.1', '::1'],
      allowedSubnets: config.allowedSubnets ?? ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'],
      blockUnknown: config.blockUnknown ?? true,
      auditLog: config.auditLog ?? true
    };

    this.parseSubnets();
  }

  private parseSubnets(): void {
    for (const subnet of this.config.allowedSubnets) {
      const parsed = this.parseSubnet(subnet);
      if (parsed) {
        this.parsedSubnets.push({ ...parsed, original: subnet });
      }
    }
  }

  private parseSubnet(subnet: string): { network: number; mask: number } | null {
    const parts = subnet.split('/');
    if (parts.length !== 2) return null;

    const ip = this.ipToNumber(parts[0]);
    if (ip === null) return null;

    const prefixLength = parseInt(parts[1], 10);
    if (isNaN(prefixLength) || prefixLength < 0 || prefixLength > 32) return null;

    const mask = prefixLength === 0 ? 0 : (~0 << (32 - prefixLength)) >>> 0;
    const network = (ip & mask) >>> 0;

    return { network, mask };
  }

  private ipToNumber(ip: string): number | null {
    const parts = ip.split('.');
    if (parts.length !== 4) return null;

    let result = 0;
    for (const part of parts) {
      const num = parseInt(part, 10);
      if (isNaN(num) || num < 0 || num > 255) return null;
      result = (result << 8) | num;
    }

    return result >>> 0;
  }

  check(ip: string): IPCheckResult {
    if (!this.config.enabled) {
      return { allowed: true, reason: 'Whitelist disabled' };
    }

    const normalizedIP = this.normalizeIP(ip);

    if (this.config.allowedIPs.includes(normalizedIP)) {
      this.log(normalizedIP, true);
      return { 
        allowed: true, 
        reason: 'IP in whitelist',
        matchedRule: normalizedIP 
      };
    }

    const ipNum = this.ipToNumber(normalizedIP);
    if (ipNum !== null) {
      for (const subnet of this.parsedSubnets) {
        if (((ipNum & subnet.mask) >>> 0) === subnet.network) {
          this.log(normalizedIP, true);
          return { 
            allowed: true, 
            reason: 'IP in allowed subnet',
            matchedRule: subnet.original 
          };
        }
      }
    }

    this.log(normalizedIP, false);
    
    if (this.config.blockUnknown) {
      return { 
        allowed: false, 
        reason: 'IP not in whitelist' 
      };
    }

    return { 
      allowed: true, 
      reason: 'Unknown IP allowed (blockUnknown=false)' 
    };
  }

  private normalizeIP(ip: string): string {
    if (ip.startsWith('::ffff:')) {
      return ip.substring(7);
    }
    return ip;
  }

  private log(ip: string, allowed: boolean): void {
    if (!this.config.auditLog) return;

    this.accessLog.push({
      ip,
      allowed,
      timestamp: Date.now()
    });

    if (this.accessLog.length > 10000) {
      this.accessLog = this.accessLog.slice(-5000);
    }
  }

  addIP(ip: string): void {
    if (!this.config.allowedIPs.includes(ip)) {
      this.config.allowedIPs.push(ip);
    }
  }

  removeIP(ip: string): void {
    const index = this.config.allowedIPs.indexOf(ip);
    if (index !== -1) {
      this.config.allowedIPs.splice(index, 1);
    }
  }

  addSubnet(subnet: string): void {
    if (!this.config.allowedSubnets.includes(subnet)) {
      this.config.allowedSubnets.push(subnet);
      const parsed = this.parseSubnet(subnet);
      if (parsed) {
        this.parsedSubnets.push({ ...parsed, original: subnet });
      }
    }
  }

  getAccessLog(limit: number = 100): Array<{ ip: string; allowed: boolean; timestamp: number }> {
    return this.accessLog.slice(-limit);
  }

  getConfig(): IPWhitelistConfig {
    return { ...this.config };
  }
}
