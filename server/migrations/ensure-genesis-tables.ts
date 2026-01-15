/**
 * One-time migration to ensure genesis_validators and genesis_config tables exist
 * This runs on production startup to create tables if they don't exist
 * Schema matches shared/schema.ts Drizzle definitions exactly
 */
import { db } from "../db";
import { sql } from "drizzle-orm";

export async function ensureGenesisTables(): Promise<void> {
  console.log("[Migration] Checking genesis tables...");
  
  try {
    // Check if genesis_config table exists with correct schema
    const chainNameExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'genesis_config' 
        AND column_name = 'chain_name'
      );
    `);
    
    const hasCorrectSchema = chainNameExists.rows[0]?.exists === true;
    
    if (!hasCorrectSchema) {
      console.log("[Migration] Genesis tables need to be created/recreated with correct schema...");
      
      // Drop existing tables if they have wrong schema
      await db.execute(sql`DROP TABLE IF EXISTS genesis_validators CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS genesis_config CASCADE`);
      console.log("[Migration] Dropped old tables with incorrect schema");
      
      // Create genesis_config with correct schema matching Drizzle
      console.log("[Migration] Creating genesis_config table...");
      await db.execute(sql`
        CREATE TABLE genesis_config (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          chain_id INTEGER NOT NULL DEFAULT 5800,
          chain_name TEXT NOT NULL DEFAULT 'TBURN Mainnet',
          network_version TEXT NOT NULL DEFAULT 'v8.0',
          genesis_timestamp BIGINT,
          genesis_block_hash TEXT,
          initial_difficulty TEXT NOT NULL DEFAULT '1',
          block_time_ms INTEGER NOT NULL DEFAULT 100,
          total_supply TEXT NOT NULL DEFAULT '10000000000000000000000000000',
          decimals INTEGER NOT NULL DEFAULT 18,
          token_symbol TEXT NOT NULL DEFAULT 'TBURN',
          token_name TEXT NOT NULL DEFAULT 'TBURN Token',
          initial_price TEXT NOT NULL DEFAULT '0.50',
          min_validator_stake TEXT NOT NULL DEFAULT '100000000000000000000000',
          max_validator_count INTEGER NOT NULL DEFAULT 125,
          initial_validator_count INTEGER NOT NULL DEFAULT 21,
          staking_reward_rate INTEGER NOT NULL DEFAULT 1250,
          consensus_type TEXT NOT NULL DEFAULT 'ai_committee_bft',
          committee_size INTEGER NOT NULL DEFAULT 21,
          block_producer_count INTEGER NOT NULL DEFAULT 7,
          quorum_threshold INTEGER NOT NULL DEFAULT 6700,
          initial_shard_count INTEGER NOT NULL DEFAULT 8,
          max_shard_count INTEGER NOT NULL DEFAULT 128,
          status TEXT NOT NULL DEFAULT 'draft',
          is_executed BOOLEAN NOT NULL DEFAULT false,
          executed_at TIMESTAMP,
          executed_by TEXT,
          execution_tx_hash TEXT,
          preflight_checks JSONB,
          preflight_passed_at TIMESTAMP,
          required_signatures INTEGER NOT NULL DEFAULT 3,
          total_signers INTEGER NOT NULL DEFAULT 5,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          created_by TEXT,
          last_modified_by TEXT
        );
      `);
      console.log("[Migration] ✅ genesis_config table created");
      
      // Create genesis_validators with correct schema matching Drizzle
      console.log("[Migration] Creating genesis_validators table...");
      await db.execute(sql`
        CREATE TABLE genesis_validators (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          config_id VARCHAR NOT NULL,
          address TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          website TEXT,
          contact_email TEXT,
          initial_stake TEXT NOT NULL,
          self_delegation TEXT NOT NULL DEFAULT '0',
          commission INTEGER NOT NULL DEFAULT 500,
          node_public_key TEXT NOT NULL,
          node_endpoint TEXT,
          p2p_port INTEGER NOT NULL DEFAULT 30303,
          rpc_port INTEGER NOT NULL DEFAULT 8545,
          tier TEXT NOT NULL DEFAULT 'genesis',
          priority INTEGER NOT NULL DEFAULT 0,
          is_verified BOOLEAN NOT NULL DEFAULT false,
          verified_at TIMESTAMP,
          verified_by TEXT,
          kyc_status TEXT NOT NULL DEFAULT 'pending',
          kyc_document_id TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      console.log("[Migration] ✅ genesis_validators table created");
      
      // Create an initial genesis config record
      console.log("[Migration] Creating initial genesis config...");
      await db.execute(sql`
        INSERT INTO genesis_config (
          id, chain_id, chain_name, network_version, status
        ) VALUES (
          gen_random_uuid(), 5800, 'TBURN Mainnet', 'v8.0', 'draft'
        );
      `);
      console.log("[Migration] ✅ Initial genesis config created");
      
    } else {
      console.log("[Migration] ✅ Genesis tables already exist with correct schema");
    }
  } catch (error) {
    console.error("[Migration] Error ensuring genesis tables:", error);
    throw error;
  }
}
