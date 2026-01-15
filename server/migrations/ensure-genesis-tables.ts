/**
 * One-time migration to ensure genesis_validators and genesis_config tables exist
 * This runs on production startup to create tables if they don't exist
 */
import { db } from "../db";
import { sql } from "drizzle-orm";

export async function ensureGenesisTables(): Promise<void> {
  console.log("[Migration] Checking genesis tables...");
  
  try {
    // Check if genesis_config table exists
    const configExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'genesis_config'
      );
    `);
    
    if (!configExists.rows[0]?.exists) {
      console.log("[Migration] Creating genesis_config table...");
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS genesis_config (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          version INTEGER NOT NULL DEFAULT 1,
          chain_id INTEGER NOT NULL DEFAULT 5800,
          network_name TEXT NOT NULL DEFAULT 'TBURN Mainnet',
          genesis_time TIMESTAMP NOT NULL DEFAULT NOW(),
          initial_validators INTEGER NOT NULL DEFAULT 125,
          min_stake TEXT NOT NULL DEFAULT '100000000000000000000000',
          max_validators INTEGER NOT NULL DEFAULT 500,
          epoch_length INTEGER NOT NULL DEFAULT 32,
          slot_duration INTEGER NOT NULL DEFAULT 12,
          target_committee_size INTEGER NOT NULL DEFAULT 128,
          ejection_balance TEXT NOT NULL DEFAULT '16000000000000000000000',
          effective_balance_increment TEXT NOT NULL DEFAULT '1000000000000000000000',
          is_finalized BOOLEAN NOT NULL DEFAULT false,
          finalized_at TIMESTAMP,
          finalized_by TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      console.log("[Migration] ✅ genesis_config table created");
    }
    
    // Check if genesis_validators table exists
    const validatorsExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'genesis_validators'
      );
    `);
    
    if (!validatorsExists.rows[0]?.exists) {
      console.log("[Migration] Creating genesis_validators table...");
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS genesis_validators (
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
    } else {
      console.log("[Migration] ✅ Genesis tables already exist");
    }
  } catch (error) {
    console.error("[Migration] Error ensuring genesis tables:", error);
  }
}
