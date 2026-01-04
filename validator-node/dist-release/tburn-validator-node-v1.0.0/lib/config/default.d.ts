/**
 * TBURN Validator Node Default Configuration
 * Production-Grade Enterprise Defaults
 */
import { ValidatorNodeConfig } from './types';
export declare const DEFAULT_CONFIG: Omit<ValidatorNodeConfig, 'validator'>;
export declare const GENESIS_VALIDATORS_REGIONS: {
    region: string;
    datacenter: string;
    count: number;
}[];
export declare const CHAIN_CONSTANTS: {
    CHAIN_ID: number;
    NETWORK_ID: string;
    GENESIS_BLOCK_HASH: string;
    GENESIS_TIMESTAMP: number;
    BLOCK_TIME_MS: number;
    EPOCH_BLOCKS: number;
    MAX_VALIDATORS: number;
    MIN_STAKE: string;
    TOTAL_SUPPLY: string;
    DECIMALS: number;
    SYMBOL: string;
    NAME: string;
};
//# sourceMappingURL=default.d.ts.map