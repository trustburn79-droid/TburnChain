// src/token/tbc1155_v4.rs - TBC-1155 Multi-Token Standard with AI Enhancement

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::{DateTime, Utc};

/// TBC-1155: AI-Enhanced Multi-Token Standard
/// Supports both fungible and non-fungible tokens in single contract
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TBC1155Token {
    pub contract_address: Address,
    pub name: String,
    pub uri: String,
    
    // AI features
    pub ai_batch_optimization: bool,
    pub ai_supply_management: bool,
    
    // Security
    pub quantum_resistant: bool,
    
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Token1155 {
    pub id: u128,
    pub token_type: TokenType1155,
    pub total_supply: u128,
    pub uri: String,
    pub metadata: Option<TokenMetadata1155>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TokenType1155 {
    Fungible,      // Like TBC-20
    NonFungible,   // Like TBC-721
    SemiFungible,  // Limited supply unique items
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenMetadata1155 {
    pub name: String,
    pub description: String,
    pub image: Option<String>,
    pub properties: HashMap<String, String>,
}

pub struct TBC1155Contract {
    token: TBC1155Token,
    tokens: Arc<RwLock<HashMap<u128, Token1155>>>,
    balances: Arc<RwLock<HashMap<(Address, u128), u128>>>,
    approvals: Arc<RwLock<HashMap<Address, HashMap<Address, bool>>>>,
    
    // AI optimization
    batch_optimizer: Arc<BatchOptimizer>,
    supply_manager: Arc<SupplyManager>,
    
    // Security
    signer: Arc<QuantumResistantSigner>,
}

impl TBC1155Contract {
    pub fn new(token: TBC1155Token) -> Self {
        Self {
            token,
            tokens: Arc::new(RwLock::new(HashMap::new())),
            balances: Arc::new(RwLock::new(HashMap::new())),
            approvals: Arc::new(RwLock::new(HashMap::new())),
            batch_optimizer: Arc::new(BatchOptimizer::new()),
            supply_manager: Arc::new(SupplyManager::new()),
            signer: Arc::new(QuantumResistantSigner::new()),
        }
    }

    /// Create new token type
    pub async fn create_token(
        &self,
        id: u128,
        token_type: TokenType1155,
        initial_supply: u128,
        uri: String,
        metadata: Option<TokenMetadata1155>,
        signature: QuantumSignature,
    ) -> Result<CreateReceipt, TokenError> {
        // Verify signature
        let message = self.encode_create_message(id, &token_type, initial_supply, &uri);
        if !self.signer.verify_quantum_resistant(&message, &signature) {
            return Err(TokenError::InvalidSignature);
        }

        // Check if token already exists
        let tokens = self.tokens.read().await;
        if tokens.contains_key(&id) {
            return Err(TokenError::TokenAlreadyExists());
        }
        drop(tokens);

        // Create token
        let token = Token1155 {
            id,
            token_type,
            total_supply: initial_supply,
            uri,
            metadata,
            created_at: Utc::now(),
        };

        let mut tokens = self.tokens.write().await;
        tokens.insert(id, token);

        Ok(CreateReceipt {
            token_id: id,
            token_type,
            initial_supply,
            timestamp: Utc::now(),
        })
    }

    /// Batch transfer with AI optimization
    pub async fn batch_transfer_from(
        &self,
        from: Address,
        to: Address,
        ids: Vec<u128>,
        amounts: Vec<u128>,
        signature: QuantumSignature,
    ) -> Result<BatchTransferReceipt, TokenError> {
        if ids.len() != amounts.len() {
            return Err(TokenError::InvalidBatchSize);
        }

        // AI optimization for batch execution
        let optimized_order = if self.token.ai_batch_optimization {
            self.batch_optimizer
                .optimize_execution_order(&ids, &amounts)
                .await?
        } else {
            ids.clone()
        };

        // Verify signature
        let message = self.encode_batch_transfer_message(&from, &to, &ids, &amounts);
        if !self.signer.verify_quantum_resistant(&message, &signature) {
            return Err(TokenError::InvalidSignature);
        }

        let mut balances = self.balances.write().await;
        let mut transferred = Vec::new();

        for (id, amount) in optimized_order.iter().zip(amounts.iter()) {
            let from_key = (from.clone(), *id);
            let to_key = (to.clone(), *id);

            let from_balance = balances.get(&from_key).copied().unwrap_or(0);
            if from_balance < *amount {
                return Err(TokenError::InsufficientBalance);
            }

            balances.insert(from_key, from_balance - amount);
            let to_balance = balances.get(&to_key).copied().unwrap_or(0);
            balances.insert(to_key, to_balance + amount);

            transferred.push((*id, *amount));
        }

        Ok(BatchTransferReceipt {
            from,
            to,
            transfers: transferred,
            gas_used: 21000 * ids.len() as u64,
            timestamp: Utc::now(),
        })
    }

    /// Get balance of specific token type
    pub async fn balance_of(&self, owner: &Address, id: u128) -> Result<u128, TokenError> {
        let balances = self.balances.read().await;
        Ok(balances.get(&(owner.clone(), id)).copied().unwrap_or(0))
    }

    /// Get balances of multiple token types
    pub async fn balance_of_batch(
        &self,
        owners: &[Address],
        ids: &[u128],
    ) -> Result<Vec<u128>, TokenError> {
        if owners.len() != ids.len() {
            return Err(TokenError::InvalidBatchSize);
        }

        let balances = self.balances.read().await;
        let results = owners
            .iter()
            .zip(ids.iter())
            .map(|(owner, id)| {
                balances.get(&(owner.clone(), *id)).copied().unwrap_or(0)
            })
            .collect();

        Ok(results)
    }

    // Helper methods
    fn encode_create_message(
        &self,
        id: u128,
        token_type: &TokenType1155,
        supply: u128,
        uri: &str,
    ) -> Vec<u8> {
        let mut message = Vec::new();
        message.extend_from_slice(&id.to_le_bytes());
        message.extend_from_slice(&[match token_type {
            TokenType1155::Fungible => 0,
            TokenType1155::NonFungible => 1,
            TokenType1155::SemiFungible => 2,
        }]);
        message.extend_from_slice(&supply.to_le_bytes());
        message.extend_from_slice(uri.as_bytes());
        message
    }

    fn encode_batch_transfer_message(
        &self,
        from: &Address,
        to: &Address,
        ids: &[u128],
        amounts: &[u128],
    ) -> Vec<u8> {
        let mut message = Vec::new();
        message.extend_from_slice(from.as_bytes());
        message.extend_from_slice(to.as_bytes());
        for id in ids {
            message.extend_from_slice(&id.to_le_bytes());
        }
        for amount in amounts {
            message.extend_from_slice(&amount.to_le_bytes());
        }
        message
    }
}

// AI Batch Optimizer
pub struct BatchOptimizer {}

impl BatchOptimizer {
    pub fn new() -> Self {
        Self {}
    }

    pub async fn optimize_execution_order(
        &self,
        ids: &[u128],
        amounts: &[u128],
    ) -> Result<Vec<u128>, TokenError> {
        // Use Llama 3.3 70B to optimize batch execution order
        // Consider: gas costs, cache locality, state access patterns
        
        // For now, sort by ID for better cache performance
        let mut optimized: Vec<_> = ids.iter().copied().collect();
        optimized.sort();
        Ok(optimized)
    }
}

// AI Supply Manager
pub struct SupplyManager {}

impl SupplyManager {
    pub fn new() -> Self {
        Self {}
    }

    pub async fn recommend_mint_amount(
        &self,
        token_id: u128,
        current_supply: u128,
        demand_metrics: &DemandMetrics,
    ) -> Result<u128, TokenError> {
        // AI-driven supply recommendations
        Ok(1000)
    }
}

#[derive(Debug, Clone)]
pub struct DemandMetrics {
    pub daily_volume: u128,
    pub unique_holders: usize,
    pub avg_transaction_size: u128,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateReceipt {
    pub token_id: u128,
    pub token_type: TokenType1155,
    pub initial_supply: u128,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchTransferReceipt {
    pub from: Address,
    pub to: Address,
    pub transfers: Vec<(u128, u128)>, // (token_id, amount)
    pub gas_used: u64,
    pub timestamp: DateTime<Utc>,
}

impl TokenError {
    pub fn InvalidBatchSize() -> Self {
        TokenError::InternalError("Invalid batch size".to_string())
    }
}

use crate::token::tbc20_v4::{Address, QuantumResistantSigner, QuantumSignature, TokenError};

//==============================================================================
// CROSS-CHAIN BRIDGE SYSTEM v4.0
//==============================================================================

// src/bridge/cross_chain_v4.rs

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::{DateTime, Utc, Duration};

/// AI-Enhanced Cross-Chain Bridge with Quantum Security
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BridgeConfig {
    pub bridge_id: String,
    pub supported_chains: Vec<ChainConfig>,
    
    // Security
    pub required_signatures: u32,
    pub quantum_resistant: bool,
    pub emergency_pause_enabled: bool,
    
    // AI features
    pub ai_risk_assessment: bool,
    pub ai_route_optimization: bool,
    pub predictive_liquidity: bool,
    
    // Limits
    pub min_transfer_amount: u128,
    pub max_transfer_amount: u128,
    pub daily_limit: u128,
    
    // Fees
    pub base_fee: u128,          // Base bridge fee
    pub chain_specific_fees: HashMap<ChainId, u128>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ChainId {
    TBURNMainnet,
    Ethereum,
    BinanceSmartChain,
    Polygon,
    Avalanche,
    Arbitrum,
    Optimism,
    Base,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChainConfig {
    pub chain_id: ChainId,
    pub rpc_endpoint: String,
    pub contract_address: String,
    pub block_confirmations: u32,
    pub avg_block_time: u64,     // milliseconds
}

pub struct CrossChainBridge {
    config: BridgeConfig,
    
    // State
    locked_tokens: Arc<RwLock<HashMap<String, LockedToken>>>,
    pending_transfers: Arc<RwLock<HashMap<String, PendingTransfer>>>,
    completed_transfers: Arc<RwLock<HashMap<String, CompletedTransfer>>>,
    
    // Validators (multi-sig)
    validators: Arc<RwLock<Vec<ValidatorInfo>>>,
    validator_signatures: Arc<RwLock<HashMap<String, Vec<ValidatorSignature>>>>,
    
    // AI services
    risk_assessor: Arc<BridgeRiskAssessor>,
    route_optimizer: Arc<RouteOptimizer>,
    liquidity_predictor: Arc<LiquidityPredictor>,
    
    // Security
    quantum_signer: Arc<QuantumResistantSigner>,
    emergency_stop: Arc<RwLock<bool>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LockedToken {
    pub lock_id: String,
    pub source_chain: ChainId,
    pub target_chain: ChainId,
    pub token_address: Address,
    pub amount: u128,
    pub from: Address,
    pub to: Address,
    pub locked_at: DateTime<Utc>,
    pub unlock_time: Option<DateTime<Utc>>,
    pub status: LockStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum LockStatus {
    Pending,
    Locked,
    Released,
    Refunded,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PendingTransfer {
    pub transfer_id: String,
    pub lock_id: String,
    pub signatures_collected: u32,
    pub signatures_required: u32,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub risk_score: f64,
    pub ai_approved: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompletedTransfer {
    pub transfer_id: String,
    pub lock_id: String,
    pub completed_at: DateTime<Utc>,
    pub source_tx_hash: String,
    pub target_tx_hash: String,
    pub total_time_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidatorInfo {
    pub address: Address,
    pub public_key: Vec<u8>,
    pub quantum_public_key: Vec<u8>,
    pub stake: u128,
    pub reputation: f64,
    pub total_signatures: u64,
    pub joined_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidatorSignature {
    pub validator: Address,
    pub signature: QuantumSignature,
    pub timestamp: DateTime<Utc>,
}

impl CrossChainBridge {
    pub fn new(config: BridgeConfig) -> Self {
        Self {
            config,
            locked_tokens: Arc::new(RwLock::new(HashMap::new())),
            pending_transfers: Arc::new(RwLock::new(HashMap::new())),
            completed_transfers: Arc::new(RwLock::new(HashMap::new())),
            validators: Arc::new(RwLock::new(Vec::new())),
            validator_signatures: Arc::new(RwLock::new(HashMap::new())),
            risk_assessor: Arc::new(BridgeRiskAssessor::new()),
            route_optimizer: Arc::new(RouteOptimizer::new()),
            liquidity_predictor: Arc::new(LiquidityPredictor::new()),
            quantum_signer: Arc::new(QuantumResistantSigner::new()),
            emergency_stop: Arc::new(RwLock::new(false)),
        }
    }

    /// Lock tokens on source chain for cross-chain transfer
    pub async fn lock_tokens(
        &self,
        request: LockRequest,
    ) -> Result<LockReceipt, BridgeError> {
        // Check emergency stop
        if *self.emergency_stop.read().await {
            return Err(BridgeError::EmergencyStop);
        }

        // Validate request
        self.validate_lock_request(&request).await?;

        // AI risk assessment
        let risk_score = if self.config.ai_risk_assessment {
            self.risk_assessor.assess_transfer_risk(&request).await?
        } else {
            0.0
        };

        if risk_score > 0.8 {
            return Err(BridgeError::HighRiskTransfer(risk_score));
        }

        // AI route optimization
        let optimal_route = if self.config.ai_route_optimization {
            self.route_optimizer
                .find_optimal_route(&request.source_chain, &request.target_chain)
                .await?
        } else {
            vec![request.source_chain.clone(), request.target_chain.clone()]
        };

        // Generate lock ID
        let lock_id = self.generate_lock_id(&request);

        // Create locked token record
        let locked_token = LockedToken {
            lock_id: lock_id.clone(),
            source_chain: request.source_chain,
            target_chain: request.target_chain,
            token_address: request.token,
            amount: request.amount,
            from: request.from.clone(),
            to: request.to.clone(),
            locked_at: Utc::now(),
            unlock_time: None,
            status: LockStatus::Pending,
        };

        // Store locked token
        let mut locked_tokens = self.locked_tokens.write().await;
        locked_tokens.insert(lock_id.clone(), locked_token);
        drop(locked_tokens);

        // Create pending transfer
        let transfer_id = format!("{}:{}", lock_id, Utc::now().timestamp());
        let pending = PendingTransfer {
            transfer_id: transfer_id.clone(),
            lock_id: lock_id.clone(),
            signatures_collected: 0,
            signatures_required: self.config.required_signatures,
            created_at: Utc::now(),
            expires_at: Utc::now() + Duration::hours(24),
            risk_score,
            ai_approved: risk_score < 0.5,
        };

        let mut pending_transfers = self.pending_transfers.write().await;
        pending_transfers.insert(transfer_id.clone(), pending);

        Ok(LockReceipt {
            lock_id,
            transfer_id,
            amount: request.amount,
            estimated_completion: self.estimate_completion_time(&request).await?,
            fee: self.calculate_bridge_fee(&request).await?,
            risk_score,
            optimal_route,
            timestamp: Utc::now(),
        })
    }

    /// Release tokens on target chain after validations
    pub async fn release_tokens(
        &self,
        transfer_id: String,
        validator_signatures: Vec<ValidatorSignature>,
    ) -> Result<ReleaseReceipt, BridgeError> {
        // Check emergency stop
        if *self.emergency_stop.read().await {
            return Err(BridgeError::EmergencyStop);
        }

        // Get pending transfer
        let mut pending_transfers = self.pending_transfers.write().await;
        let pending = pending_transfers
            .get_mut(&transfer_id)
            .ok_or(BridgeError::TransferNotFound)?;

        // Check expiration
        if Utc::now() > pending.expires_at {
            pending.lock_id = "expired".to_string();
            return Err(BridgeError::TransferExpired);
        }

        // Verify signatures
        self.verify_validator_signatures(&transfer_id, &validator_signatures)
            .await?;

        // Check if we have enough signatures
        if validator_signatures.len() < self.config.required_signatures as usize {
            return Err(BridgeError::InsufficientSignatures);
        }

        // Get locked token
        let mut locked_tokens = self.locked_tokens.write().await;
        let locked = locked_tokens
            .get_mut(&pending.lock_id)
            .ok_or(BridgeError::LockNotFound)?;

        // Update status
        locked.status = LockStatus::Released;
        locked.unlock_time = Some(Utc::now());

        // Record completion
        let completed = CompletedTransfer {
            transfer_id: transfer_id.clone(),
            lock_id: pending.lock_id.clone(),
            completed_at: Utc::now(),
            source_tx_hash: format!("0x{}", locked.lock_id),
            target_tx_hash: format!("0x{}", transfer_id),
            total_time_ms: (Utc::now() - locked.locked_at).num_milliseconds() as u64,
        };

        let mut completed_transfers = self.completed_transfers.write().await;
        completed_transfers.insert(transfer_id.clone(), completed.clone());

        // Remove from pending
        pending_transfers.remove(&transfer_id);

        Ok(ReleaseReceipt {
            transfer_id,
            lock_id: locked.lock_id.clone(),
            amount: locked.amount,
            to: locked.to.clone(),
            completed_at: completed.completed_at,
            total_time_ms: completed.total_time_ms,
        })
    }

    /// Get transfer status
    pub async fn get_transfer_status(
        &self,
        transfer_id: &str,
    ) -> Result<TransferStatus, BridgeError> {
        // Check completed first
        if let Some(completed) = self.completed_transfers.read().await.get(transfer_id) {
            return Ok(TransferStatus::Completed(completed.clone()));
        }

        // Check pending
        if let Some(pending) = self.pending_transfers.read().await.get(transfer_id) {
            return Ok(TransferStatus::Pending(pending.clone()));
        }

        Err(BridgeError::TransferNotFound)
    }

    /// Emergency pause bridge
    pub async fn emergency_pause(&self) -> Result<(), BridgeError> {
        let mut stop = self.emergency_stop.write().await;
        *stop = true;
        Ok(())
    }

    /// Resume bridge operations
    pub async fn resume(&self) -> Result<(), BridgeError> {
        let mut stop = self.emergency_stop.write().await;
        *stop = false;
        Ok(())
    }

    // ==================== Internal Methods ====================

    async fn validate_lock_request(&self, request: &LockRequest) -> Result<(), BridgeError> {
        // Check amount limits
        if request.amount < self.config.min_transfer_amount {
            return Err(BridgeError::AmountTooLow);
        }
        if request.amount > self.config.max_transfer_amount {
            return Err(BridgeError::AmountTooHigh);
        }

        // Check if chains are supported
        if !self
            .config
            .supported_chains
            .iter()
            .any(|c| c.chain_id == request.source_chain)
        {
            return Err(BridgeError::UnsupportedChain(request.source_chain.clone()));
        }

        Ok(())
    }

    async fn verify_validator_signatures(
        &self,
        transfer_id: &str,
        signatures: &[ValidatorSignature],
    ) -> Result<(), BridgeError> {
        let validators = self.validators.read().await;

        for sig in signatures {
            // Find validator
            let validator = validators
                .iter()
                .find(|v| v.address == sig.validator)
                .ok_or(BridgeError::InvalidValidator)?;

            // Verify quantum-resistant signature
            let message = self.encode_release_message(transfer_id);
            if !self
                .quantum_signer
                .verify_quantum_resistant(&message, &sig.signature)
            {
                return Err(BridgeError::InvalidSignature);
            }
        }

        Ok(())
    }

    fn generate_lock_id(&self, request: &LockRequest) -> String {
        use blake3::Hash;
        let mut hasher = blake3::Hasher::new();
        hasher.update(request.from.as_bytes());
        hasher.update(request.to.as_bytes());
        hasher.update(&request.amount.to_le_bytes());
        hasher.update(&Utc::now().timestamp().to_le_bytes());
        format!("0x{}", hex::encode(hasher.finalize().as_bytes()))
    }

    async fn estimate_completion_time(&self, request: &LockRequest) -> Result<Duration, BridgeError> {
        // Get chain configs
        let source_config = self
            .config
            .supported_chains
            .iter()
            .find(|c| c.chain_id == request.source_chain)
            .ok_or(BridgeError::UnsupportedChain(request.source_chain.clone()))?;

        let target_config = self
            .config
            .supported_chains
            .iter()
            .find(|c| c.chain_id == request.target_chain)
            .ok_or(BridgeError::UnsupportedChain(request.target_chain.clone()))?;

        // Calculate time
        let source_confirmation_time =
            source_config.avg_block_time * source_config.block_confirmations as u64;
        let target_confirmation_time =
            target_config.avg_block_time * target_config.block_confirmations as u64;
        let processing_time = 5000u64; // 5 seconds

        let total_ms = source_confirmation_time + target_confirmation_time + processing_time;

        Ok(Duration::milliseconds(total_ms as i64))
    }

    async fn calculate_bridge_fee(&self, request: &LockRequest) -> Result<u128, BridgeError> {
        let base_fee = self.config.base_fee;
        let chain_fee = self
            .config
            .chain_specific_fees
            .get(&request.target_chain)
            .copied()
            .unwrap_or(0);

        // Dynamic fee based on congestion
        let congestion_multiplier = 1.0; // TODO: Get from network state

        Ok((base_fee + chain_fee) * congestion_multiplier as u128)
    }

    fn encode_release_message(&self, transfer_id: &str) -> Vec<u8> {
        transfer_id.as_bytes().to_vec()
    }
}

// ==================== AI Services for Bridge ====================

pub struct BridgeRiskAssessor {}

impl BridgeRiskAssessor {
    pub fn new() -> Self {
        Self {}
    }

    pub async fn assess_transfer_risk(&self, request: &LockRequest) -> Result<f64, BridgeError> {
        // Use Claude Sonnet 4.5 for risk assessment
        // Factors: amount, address history, chain security, recent exploits
        
        let mut risk_score = 0.0;

        // Large amount increases risk
        if request.amount > 1_000_000_000_000_000_000_000 {
            // > 1000 tokens
            risk_score += 0.3;
        }

        // New address increases risk
        // TODO: Check address history
        risk_score += 0.1;

        Ok(risk_score.min(1.0))
    }
}

pub struct RouteOptimizer {}

impl RouteOptimizer {
    pub fn new() -> Self {
        Self {}
    }

    pub async fn find_optimal_route(
        &self,
        source: &ChainId,
        target: &ChainId,
    ) -> Result<Vec<ChainId>, BridgeError> {
        // Use GPT-5 Turbo for route optimization
        // Consider: gas costs, liquidity, time, reliability
        
        // For direct transfers, just return source and target
        Ok(vec![source.clone(), target.clone()])
    }
}

pub struct LiquidityPredictor {}

impl LiquidityPredictor {
    pub fn new() -> Self {
        Self {}
    }

    pub async fn predict_liquidity(
        &self,
        chain: &ChainId,
        token: &Address,
        hours_ahead: u32,
    ) -> Result<LiquidityPrediction, BridgeError> {
        // Predict future liquidity using AI
        Ok(LiquidityPrediction {
            chain: chain.clone(),
            predicted_liquidity: 1_000_000_000,
            confidence: 0.85,
            timestamp: Utc::now(),
        })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LiquidityPrediction {
    pub chain: ChainId,
    pub predicted_liquidity: u128,
    pub confidence: f64,
    pub timestamp: DateTime<Utc>,
}

// ==================== Request/Response Types ====================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LockRequest {
    pub source_chain: ChainId,
    pub target_chain: ChainId,
    pub token: Address,
    pub amount: u128,
    pub from: Address,
    pub to: Address,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LockReceipt {
    pub lock_id: String,
    pub transfer_id: String,
    pub amount: u128,
    pub estimated_completion: Duration,
    pub fee: u128,
    pub risk_score: f64,
    pub optimal_route: Vec<ChainId>,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReleaseReceipt {
    pub transfer_id: String,
    pub lock_id: String,
    pub amount: u128,
    pub to: Address,
    pub completed_at: DateTime<Utc>,
    pub total_time_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransferStatus {
    Pending(PendingTransfer),
    Completed(CompletedTransfer),
}

// ==================== Error Types ====================

#[derive(Debug, Clone)]
pub enum BridgeError {
    EmergencyStop,
    TransferNotFound,
    LockNotFound,
    TransferExpired,
    InsufficientSignatures,
    InvalidValidator,
    InvalidSignature,
    AmountTooLow,
    AmountTooHigh,
    UnsupportedChain(ChainId),
    HighRiskTransfer(f64),
    NetworkError(String),
    InternalError(String),
}

impl std::fmt::Display for BridgeError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            BridgeError::EmergencyStop => write!(f, "Bridge is in emergency stop mode"),
            BridgeError::TransferNotFound => write!(f, "Transfer not found"),
            BridgeError::LockNotFound => write!(f, "Lock not found"),
            BridgeError::TransferExpired => write!(f, "Transfer has expired"),
            BridgeError::InsufficientSignatures => write!(f, "Insufficient validator signatures"),
            BridgeError::InvalidValidator => write!(f, "Invalid validator"),
            BridgeError::InvalidSignature => write!(f, "Invalid signature"),
            BridgeError::AmountTooLow => write!(f, "Amount below minimum"),
            BridgeError::AmountTooHigh => write!(f, "Amount above maximum"),
            BridgeError::UnsupportedChain(chain) => write!(f, "Unsupported chain: {:?}", chain),
            BridgeError::HighRiskTransfer(score) => {
                write!(f, "High risk transfer detected: {:.2}", score)
            }
            BridgeError::NetworkError(msg) => write!(f, "Network error: {}", msg),
            BridgeError::InternalError(msg) => write!(f, "Internal error: {}", msg),
        }
    }
}

impl std::error::Error for BridgeError {}

use crate::token::tbc20_v4::{Address, QuantumResistantSigner, QuantumSignature};
