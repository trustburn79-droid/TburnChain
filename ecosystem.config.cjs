/**
 * PM2 Production Configuration for TBURN Mainnet
 * Google Cloud Server: 32-core, 256GB RAM
 * 
 * NOTE: File extension is .cjs (CommonJS) to work with "type": "module" in package.json
 * 
 * DEPLOYMENT STEPS:
 * 1. Copy this file to Google Cloud server
 * 2. Run: pm2 start ecosystem.config.cjs
 * 3. Run: pm2 save
 * 4. Verify: curl http://localhost:5000/api/shards/config | jq '.maxShards'
 */

module.exports = {
  apps: [{
    name: 'tburn-mainnet',
    // [중요 변경] npm 명령어를 쓰지 않고, 빌드된 파일을 직접 실행합니다.
    script: '/home/trustburn79/TburnChain/dist/index.js', 
    cwd: '/home/trustburn79/TburnChain',
    
    // CRITICAL: Environment variables for 64-shard production
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      DATABASE_URL: 'postgresql://neondb_owner:npg_yVYPAU80cFez@ep-billowing-glitter-ahtrm1id.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
      
      // SHARD CONFIGURATION - 32-core server optimized
      MAX_SHARDS: '64',           // 64 shards for 32-core server
      MIN_SHARDS: '5',            // Minimum shard count
      
      // SECURITY
      COOKIE_SECURE: 'true',      // Required for HTTPS
      
      // DATABASE (copy from your .env file)
      // DATABASE_URL: 'your_database_url_here',
      // SESSION_SECRET: 'your_session_secret_here',
    },
    
    // PM2 Settings
    instances: 1,                  // Single instance for blockchain node
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '8G',
    
    // Logging
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Restart policy
    restart_delay: 5000,
    max_restarts: 10,
    min_uptime: '10s',
  }]
};
