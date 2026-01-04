/**
 * TBURN Validator Node API Routes
 * Enterprise-Grade REST API for Validator Management
 */

import express, { Router, Request, Response, NextFunction } from 'express';
import { ValidatorNode } from '../core/validator-node';
import { ApiConfig } from '../config/types';
import { createModuleLogger } from '../utils/logger';

const log = createModuleLogger('API');

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export function createApiRouter(node: ValidatorNode, config: ApiConfig): Router {
  const router = Router();
  const rateLimits: Map<string, RateLimitEntry> = new Map();

  const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    
    let entry = rateLimits.get(ip);
    if (!entry || now > entry.resetTime) {
      entry = { count: 0, resetTime: now + config.rateLimit.windowMs };
      rateLimits.set(ip, entry);
    }
    
    entry.count++;
    
    if (entry.count > config.rateLimit.maxRequests) {
      res.status(429).json({ error: 'Rate limit exceeded' });
      return;
    }
    
    next();
  };

  const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (!config.authentication.enabled) {
      return next();
    }
    
    const apiKey = req.header(config.authentication.apiKeyHeader);
    if (!apiKey || !config.authentication.apiKeys.includes(apiKey)) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    next();
  };

  router.use(rateLimitMiddleware);

  router.get('/health', (_req: Request, res: Response) => {
    const status = node.getStatus();
    res.json({
      status: 'healthy',
      nodeId: status.nodeId,
      chainId: status.chainId,
      height: status.currentHeight,
      peers: status.peersCount,
      uptime: status.uptime,
    });
  });

  router.get('/status', (_req: Request, res: Response) => {
    res.json(node.getStatus());
  });

  router.get('/metrics', (_req: Request, res: Response) => {
    res.json(node.getMetrics());
  });

  router.get('/peers', (_req: Request, res: Response) => {
    res.json({
      count: node.getPeers().length,
      peers: node.getPeers(),
    });
  });

  router.get('/mempool', authMiddleware, (_req: Request, res: Response) => {
    res.json({
      size: node.getMempoolSize(),
      maxSize: node.getConfig().security.maxMempoolSize,
    });
  });

  router.get('/consensus', (_req: Request, res: Response) => {
    const status = node.getStatus();
    res.json(status.consensusState);
  });

  router.post('/transactions', authMiddleware, express.json(), async (req: Request, res: Response) => {
    try {
      const tx = req.body;
      
      if (!tx.from || !tx.to || !tx.value) {
        res.status(400).json({ error: 'Invalid transaction format' });
        return;
      }
      
      const hash = await node.submitTransaction(tx);
      res.json({ hash, status: 'pending' });
    } catch (error) {
      log.error('Transaction submission failed', { error: (error as Error).message });
      res.status(500).json({ error: 'Transaction submission failed' });
    }
  });

  router.get('/blocks/latest', async (_req: Request, res: Response) => {
    const status = node.getStatus();
    res.json({
      height: status.currentHeight,
      timestamp: Date.now(),
    });
  });

  router.get('/validator', (_req: Request, res: Response) => {
    const config = node.getConfig();
    res.json({
      address: config.validator.address,
      name: config.validator.name,
      stake: config.validator.stake,
      commission: config.validator.commission,
      region: config.geo.region,
      datacenter: config.geo.datacenter,
    });
  });

  router.get('/config', authMiddleware, (_req: Request, res: Response) => {
    const config = node.getConfig();
    res.json({
      nodeId: config.nodeId,
      chainId: config.chainId,
      networkId: config.networkId,
      network: {
        listenPort: config.network.listenPort,
        maxPeers: config.network.maxPeers,
      },
      consensus: config.consensus,
      geo: config.geo,
    });
  });

  router.post('/admin/stop', authMiddleware, async (_req: Request, res: Response) => {
    log.warn('Received stop command via API');
    res.json({ status: 'stopping' });
    
    setTimeout(async () => {
      await node.stop();
      process.exit(0);
    }, 1000);
  });

  return router;
}

export function startApiServer(node: ValidatorNode, config: ApiConfig): void {
  if (!config.enabled) {
    log.info('API server disabled');
    return;
  }

  const app = express();
  
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', config.corsOrigins.join(','));
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-API-Key');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    next();
  });
  
  app.use('/api/v1', createApiRouter(node, config));
  
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    log.error('API error', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  });

  app.listen(config.port, config.host, () => {
    log.info('API server started', { host: config.host, port: config.port });
  });
}
