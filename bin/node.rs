use tburn_chain_v4_0::core::Blockchain;
use tburn_chain_v4_0::core::rpc::RpcServer;
use std::sync::Arc;
use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize logging
    tracing_subscriber::fmt::init();

    println!("🔥 Starting BURN Chain v4.0 Node...");

    // Initialize Database
    let db_url = "sqlite://explorer.db?mode=rwc";
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(db_url)
        .await?;

    // Run Migrations
    sqlx::query(include_str!("../migrations/20251122000000_explorer_schema.sql"))
        .execute(&pool)
        .await?;

    println!("✅ Database initialized");

    // Initialize Blockchain
    let blockchain = Arc::new(Blockchain::new());

    // Initialize RPC Server
    let rpc_server = RpcServer::new(blockchain.clone(), pool);

    // Start RPC Server
    rpc_server.start_all().await.map_err(|e| e.into())
}
