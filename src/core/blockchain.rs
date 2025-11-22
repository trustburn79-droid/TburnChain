use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone)]
pub struct Blockchain {
    // In a real implementation, this would hold blocks, state, etc.
    // For now, we'll just use a counter or mock data.
    height: Arc<RwLock<u64>>,
}

impl Blockchain {
    pub fn new() -> Self {
        Self {
            height: Arc::new(RwLock::new(1234567)),
        }
    }

    pub async fn get_height(&self) -> u64 {
        *self.height.read().await
    }
    
    pub async fn get_tps(&self) -> u64 {
        347892 // Mock value matching the dashboard
    }
}
