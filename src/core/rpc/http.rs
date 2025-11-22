use axum::{
    routing::get,
    Router,
    Json,
    extract::State,
};
use std::sync::Arc;
use std::net::SocketAddr;
use crate::core::Blockchain;
use serde::{Serialize};
use tower_http::cors::{CorsLayer, Any};
use sqlx::SqlitePool;

#[derive(Clone)]
pub struct AppState {
    blockchain: Arc<Blockchain>,
    db_pool: SqlitePool,
}

pub async fn start_server(blockchain: Arc<Blockchain>, db_pool: SqlitePool) -> Result<(), Box<dyn std::error::Error>> {
    let state = AppState { blockchain, db_pool };

    let app = Router::new()
        .route("/api/stats", get(get_stats))
        .route("/api/blocks", get(get_blocks))
        .route("/api/txs", get(get_txs))
        .route("/api/validators", get(get_validators))
        .layer(CorsLayer::new().allow_origin(Any).allow_methods(Any))
        .with_state(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("🌍 HTTP API listening on {}", addr);
    
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await?;
        
    Ok(())
}

#[derive(Serialize, sqlx::FromRow)]
struct StatsResponse {
    height: i64,
    tps: i64,
    active_shards: i64,
    active_validators: i64,
}

async fn get_stats(State(state): State<AppState>) -> Json<StatsResponse> {
    let stats = sqlx::query_as::<_, StatsResponse>("SELECT height, tps, active_shards, active_validators FROM network_stats WHERE id = 1")
        .fetch_one(&state.db_pool)
        .await
        .unwrap_or(StatsResponse { height: 0, tps: 0, active_shards: 0, active_validators: 0 });
    
    Json(stats)
}

#[derive(Serialize, sqlx::FromRow)]
struct Block {
    number: i64,
    tx_count: i64,
    shard_id: i64,
    timestamp: i64,
}

async fn get_blocks(State(state): State<AppState>) -> Json<Vec<Block>> {
    let blocks = sqlx::query_as::<_, Block>("SELECT number, tx_count, shard_id, timestamp FROM blocks ORDER BY number DESC LIMIT 10")
        .fetch_all(&state.db_pool)
        .await
        .unwrap_or_default();
    Json(blocks)
}

#[derive(Serialize, sqlx::FromRow)]
struct Tx {
    hash: String,
    from_addr: String,
    to_addr: String,
    value: String,
    status: String,
    tx_type: String,
}

async fn get_txs(State(state): State<AppState>) -> Json<Vec<Tx>> {
    let txs = sqlx::query_as::<_, Tx>("SELECT hash, from_addr, to_addr, value, status, tx_type FROM transactions ORDER BY timestamp DESC LIMIT 10")
        .fetch_all(&state.db_pool)
        .await
        .unwrap_or_default();
    Json(txs)
}

#[derive(Serialize, sqlx::FromRow)]
struct Validator {
    address: String,
    stake: String,
    power: f64,
    status: String,
    type_: String, // Mapped from 'type' column
}

async fn get_validators(State(state): State<AppState>) -> Json<Vec<Validator>> {
    let validators = sqlx::query_as::<_, Validator>("SELECT address, stake, power, status, type as type_ FROM validators ORDER BY power DESC LIMIT 20")
        .fetch_all(&state.db_pool)
        .await
        .unwrap_or_default();
    Json(validators)
}
