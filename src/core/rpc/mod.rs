pub mod http;
pub mod websocket;
pub mod ipc;

use std::sync::Arc;
use crate::core::Blockchain;
use sqlx::sqlite::SqlitePool;

pub struct RpcServer {
    blockchain: Arc<Blockchain>,
    db_pool: SqlitePool,
}

impl RpcServer {
    pub fn new(blockchain: Arc<Blockchain>, db_pool: SqlitePool) -> Self {
        Self { blockchain, db_pool }
    }

    pub async fn start_all(&self) -> Result<(), Box<dyn std::error::Error>> {
        println!("🚀 Starting RPC Server...");
        
        // Start HTTP Server
        let http_server = http::start_server(self.blockchain.clone(), self.db_pool.clone());
        
        // Wait for server
        http_server.await?;
        
        Ok(())
    }
}
