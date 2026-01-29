/**
 * SQL Security Utilities
 * Prevents SQL injection by validating and sanitizing query parameters
 * 
 * @module sql-security
 * @version 2.0.0
 * @updated 2026-01-29
 */

// Whitelist of allowed tables for VACUUM, ANALYZE, and other DDL operations
export const ALLOWED_TABLES = [
  // Core blockchain tables
  'blocks',
  'transactions',
  'tokens',
  'wallets',
  'validators',
  'delegations',
  'rewards',
  'slashing_events',
  
  // User and auth tables
  'members',
  'sessions',
  'admin_audit_logs',
  'security_events',
  
  // Staking and custody tables
  'custody_transactions',
  'custody_wallets',
  'custody_approvals',
  'staking_positions',
  'validator_applications',
  
  // DeFi tables
  'dex_pools',
  'dex_trades',
  'lending_markets',
  'lending_positions',
  'bridge_transactions',
  
  // Compliance and reporting
  'compliance_reports',
  'aml_screenings',
  'kyc_verifications',
  
  // System tables
  'sync_state',
  'bootstrap_cache',
  'distribution_schedules',
  'vesting_schedules',
] as const;

export type AllowedTable = typeof ALLOWED_TABLES[number];

/**
 * Validates if a table name is in the allowed whitelist
 * @param tableName - The table name to validate
 * @returns true if table is allowed, false otherwise
 */
export function isAllowedTable(tableName: string): tableName is AllowedTable {
  return ALLOWED_TABLES.includes(tableName.toLowerCase() as AllowedTable);
}

/**
 * Validates and returns a safe table name
 * @param tableName - The table name from user input
 * @returns The validated table name or null if invalid
 */
export function getSafeTableName(tableName: string | undefined): string | null {
  if (!tableName || typeof tableName !== 'string') return null;
  
  const normalized = tableName.toLowerCase().trim();
  
  // Additional regex validation for extra safety
  if (!/^[a-z_][a-z0-9_]*$/.test(normalized)) return null;
  
  return isAllowedTable(normalized) ? normalized : null;
}

/**
 * Validates an array of table names and returns only valid ones
 * @param tables - Array of table names to validate
 * @returns Array of validated table names
 */
export function getSafeTableNames(tables: string[]): string[] {
  return tables
    .map(t => getSafeTableName(t))
    .filter((t): t is string => t !== null);
}

// Whitelist of allowed columns for different tables
export const ALLOWED_SORT_COLUMNS = {
  members: ['created_at', 'account_address', 'display_name', 'member_tier', 'member_status', 'aml_risk_score', 'kyc_level', 'legal_name'],
  validator_applications: ['submitted_at', 'status', 'validator_name', 'node_location'],
  security_events: ['occurred_at', 'event_type', 'severity', 'source_ip'],
  admin_audit_logs: ['created_at', 'action', 'admin_id', 'resource_type'],
  compliance_reports: ['created_at', 'report_type', 'status', 'period_start'],
  blocks: ['number', 'timestamp', 'transactions_count', 'gas_used'],
  transactions: ['timestamp', 'value', 'gas_used', 'block_number'],
  tokens: ['created_at', 'symbol', 'name', 'total_supply', 'holders'],
  wallets: ['balance', 'created_at', 'transaction_count', 'last_active']
} as const;

/**
 * Validates and returns a safe column name for ORDER BY clauses
 * @param table - The table name to get allowed columns for
 * @param requestedColumn - The column name from user input
 * @param defaultColumn - The default column to use if validation fails
 * @returns A safe column name from the whitelist
 */
export function getSafeSortColumn(
  table: keyof typeof ALLOWED_SORT_COLUMNS,
  requestedColumn: string | undefined,
  defaultColumn: string
): string {
  const allowedColumns = ALLOWED_SORT_COLUMNS[table];
  if (!requestedColumn) return defaultColumn;
  
  const normalized = requestedColumn.toLowerCase().trim();
  return (allowedColumns as readonly string[]).includes(normalized) ? normalized : defaultColumn;
}

/**
 * Validates and returns a safe sort order
 * @param requestedOrder - The sort order from user input
 * @returns Either 'ASC' or 'DESC'
 */
export function getSafeSortOrder(requestedOrder: string | undefined): 'ASC' | 'DESC' {
  if (!requestedOrder) return 'DESC';
  return requestedOrder.toLowerCase().trim() === 'asc' ? 'ASC' : 'DESC';
}

/**
 * Validates a numeric parameter
 * @param value - The value to validate
 * @param defaultValue - Default value if validation fails
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 */
export function getSafeNumber(
  value: string | undefined,
  defaultValue: number,
  min: number = 1,
  max: number = 10000
): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return defaultValue;
  return Math.max(min, Math.min(max, parsed));
}

/**
 * Validates a string parameter against a whitelist
 * @param value - The value to validate
 * @param allowedValues - Array of allowed values
 * @param defaultValue - Default value if validation fails
 */
export function getSafeEnum<T extends string>(
  value: string | undefined,
  allowedValues: readonly T[],
  defaultValue: T
): T {
  if (!value) return defaultValue;
  const normalized = value.toLowerCase().trim() as T;
  return allowedValues.includes(normalized) ? normalized : defaultValue;
}

/**
 * Sanitizes a search string for ILIKE queries
 * Escapes special characters that could affect pattern matching
 */
export function sanitizeSearchString(search: string | undefined): string | null {
  if (!search || typeof search !== 'string') return null;
  // Escape special characters for LIKE/ILIKE
  return search.replace(/[%_\\]/g, '\\$&');
}
