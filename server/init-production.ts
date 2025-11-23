import { ValidatorSimulationService } from './validator-simulation';
import { DbStorage } from './storage';

/**
 * Production Initialization Script
 * This script initializes the production database with necessary data
 * to ensure the TBURN blockchain explorer works correctly in production.
 */

async function initializeProduction() {
  console.log('🚀 Initializing production environment...');
  
  try {
    // Initialize database storage
    const storage = new DbStorage();
    
    // Check if validators already exist
    const validators = await storage.getAllValidators();
    console.log(`📊 Found ${validators.length} validators in production database`);
    
    if (validators.length === 0) {
      console.log('⚠️ No validators found, initializing...');
      
      // Initialize validator simulation service
      const simulationService = new ValidatorSimulationService(storage);
      
      // Initialize validators (this will create 125 validators)
      await simulationService.initializeValidators();
      console.log('✅ Validators initialized successfully');
      
      // Create initial blocks to populate the database
      console.log('📦 Creating initial blocks...');
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
        // The simulation service will create blocks automatically
      }
      console.log('✅ Initial blocks created');
    } else {
      console.log('✅ Validators already exist, skipping initialization');
    }
    
    // Verify network stats
    const networkStats = await storage.getNetworkStats();
    if (networkStats) {
      console.log('📈 Network Stats:');
      console.log(`  - Current Block Height: ${networkStats.currentBlockHeight}`);
      console.log(`  - TPS: ${networkStats.tps}`);
      console.log(`  - Active Validators: ${networkStats.activeValidators}`);
    }
    
    console.log('🎉 Production initialization complete!');
  } catch (error) {
    console.error('❌ Production initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization
initializeProduction();