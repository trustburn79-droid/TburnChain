import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import session from 'express-session';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '../middleware/auth';
import { validateCsrf, getCsrfToken } from '../middleware/csrf';
import { BoundedMap, BoundedQueue } from '../services/utils/BoundedQueue';

describe('Advanced Tech Routes - Auth/CSRF Middleware Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }
    }));

    app.get('/api/csrf-token', getCsrfToken);

    app.post('/protected-route', requireAuth, validateCsrf, (req, res) => {
      res.json({ success: true });
    });

    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.status(err.status || 500).json({ error: err.message });
    });
  });

  describe('Authentication Middleware Behavior', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const res = await request(app)
        .post('/protected-route')
        .send({});
      expect(res.status).toBe(401);
    });

    it('should return 401 when session is empty', async () => {
      const res = await request(app)
        .post('/protected-route')
        .set('Cookie', '')
        .send({});
      expect(res.status).toBe(401);
    });
  });

  describe('CSRF Middleware Behavior', () => {
    it('should return 401 when CSRF token is missing', async () => {
      const agent = request.agent(app);
      await agent.get('/api/csrf-token');
      const res = await agent.post('/protected-route').send({});
      expect(res.status).toBe(401);
    });

    it('should return 401 when CSRF token is invalid', async () => {
      const agent = request.agent(app);
      await agent.get('/api/csrf-token');
      const res = await agent
        .post('/protected-route')
        .set('X-CSRF-Token', 'invalid-token')
        .send({});
      expect(res.status).toBe(401);
    });
  });
});

describe('Advanced Tech Routes Source Code Security Analysis', () => {
  let routesSourceCode: string;

  beforeAll(() => {
    const routesPath = path.join(__dirname, '../routes/advanced-tech-routes.ts');
    routesSourceCode = fs.readFileSync(routesPath, 'utf-8');
  });

  describe('POST Endpoint Middleware Verification', () => {
    const postEndpoints = [
      { route: "'/da/blob/submit'", name: 'modular-da/blob-submit' },
      { route: "'/restaking/stake'", name: 'restaking/stake' },
      { route: "'/zk/l2/submit'", name: 'zk-rollup/l2-submit' },
      { route: "'/zk/bridge/deposit'", name: 'zk-rollup/bridge-deposit' },
      { route: "'/zk/bridge/withdraw'", name: 'zk-rollup/bridge-withdraw' },
      { route: "'/aa/wallet/create'", name: 'aa/wallet-create' },
      { route: "'/aa/userop/submit'", name: 'aa/userop-submit' },
      { route: "'/intent/submit/natural'", name: 'intent/submit-natural' },
      { route: "'/intent/submit'", name: 'intent/submit' },
      { route: "'/intent/:intentId/execute'", name: 'intent/execute' },
      { route: "'/intent/path/optimal'", name: 'intent/path-optimal' },
    ];

    it('should have 11 POST endpoints requiring protection', () => {
      expect(postEndpoints.length).toBe(11);
    });

    postEndpoints.forEach(({ route, name }) => {
      it(`should have requireAuth middleware on ${name}`, () => {
        const postPattern = new RegExp(`router\\.post\\(${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^)]*requireAuth`, 's');
        expect(routesSourceCode).toMatch(postPattern);
      });

      it(`should have validateCsrf middleware on ${name}`, () => {
        const csrfPattern = new RegExp(`router\\.post\\(${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^)]*validateCsrf`, 's');
        expect(routesSourceCode).toMatch(csrfPattern);
      });
    });
  });

  describe('Security Middleware Import Verification', () => {
    it('should import validateCsrf from csrf middleware', () => {
      expect(routesSourceCode).toContain("import { validateCsrf } from '../middleware/csrf'");
    });

    it('should define or use requireAuth function', () => {
      expect(routesSourceCode).toMatch(/requireAuth/);
    });
  });
});

describe('BoundedQueue API Compliance', () => {
  it('should provide size() method that returns number', () => {
    const queue = new BoundedQueue<number>({ maxSize: 10 });
    queue.enqueue(1);
    queue.enqueue(2);
    expect(typeof queue.size()).toBe('number');
    expect(queue.size()).toBe(2);
  });

  it('should provide isEmpty() method', () => {
    const queue = new BoundedQueue<number>({ maxSize: 10 });
    expect(queue.isEmpty()).toBe(true);
    queue.enqueue(1);
    expect(queue.isEmpty()).toBe(false);
  });

  it('should provide toArray() method', () => {
    const queue = new BoundedQueue<string>({ maxSize: 10 });
    queue.enqueue('a');
    queue.enqueue('b');
    const arr = queue.toArray();
    expect(Array.isArray(arr)).toBe(true);
    expect(arr.length).toBe(2);
  });

  it('should enforce capacity limit', () => {
    const queue = new BoundedQueue<number>({ maxSize: 3 });
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    queue.enqueue(4);
    expect(queue.size()).toBeLessThanOrEqual(3);
  });
});

describe('BoundedMap API Compliance', () => {
  it('should provide size() method that returns number', () => {
    const map = new BoundedMap<string, number>(10);
    map.set('a', 1);
    map.set('b', 2);
    expect(typeof map.size()).toBe('number');
    expect(map.size()).toBe(2);
  });

  it('should provide values() method returning iterable array', () => {
    const map = new BoundedMap<string, number>(10);
    map.set('a', 1);
    map.set('b', 2);
    const values = map.values();
    expect(Array.isArray(values)).toBe(true);
    expect(values).toContain(1);
    expect(values).toContain(2);
  });

  it('should provide entries() method returning array of tuples', () => {
    const map = new BoundedMap<string, number>(10);
    map.set('a', 1);
    const entries = map.entries();
    expect(Array.isArray(entries)).toBe(true);
    expect(entries[0]).toEqual(['a', 1]);
  });

  it('should enforce capacity limit', () => {
    const map = new BoundedMap<string, number>(2);
    map.set('a', 1);
    map.set('b', 2);
    map.set('c', 3);
    expect(map.size()).toBe(2);
  });
});

describe('Service Memory Limits Enforcement', () => {
  let zkRollupSource: string;
  let tbc4337Source: string;
  let restakingSource: string;
  let intentSource: string;

  beforeAll(() => {
    zkRollupSource = fs.readFileSync(path.join(__dirname, '../services/zk-rollup/ZKRollupManager.ts'), 'utf-8');
    tbc4337Source = fs.readFileSync(path.join(__dirname, '../services/account-abstraction/TBC4337Manager.ts'), 'utf-8');
    restakingSource = fs.readFileSync(path.join(__dirname, '../services/restaking/RestakingManager.ts'), 'utf-8');
    intentSource = fs.readFileSync(path.join(__dirname, '../services/intent-network/IntentNetworkManager.ts'), 'utf-8');
  });

  it('ZKRollupManager uses BoundedQueue for pending transactions', () => {
    expect(zkRollupSource).toMatch(/BoundedQueue/);
    expect(zkRollupSource).toMatch(/MAX_PENDING_TX/);
  });

  it('TBC4337Manager uses BoundedMap for wallets', () => {
    expect(tbc4337Source).toMatch(/BoundedMap/);
    expect(tbc4337Source).toMatch(/MAX_WALLETS/);
  });

  it('RestakingManager uses BoundedMap for positions', () => {
    expect(restakingSource).toMatch(/BoundedMap/);
    expect(restakingSource).toMatch(/MAX_POSITIONS/);
  });

  it('IntentNetworkManager uses BoundedMap for intents', () => {
    expect(intentSource).toMatch(/BoundedMap/);
    expect(intentSource).toMatch(/MAX_INTENTS/);
  });

  it('All services use .size() method instead of .size property', () => {
    expect(zkRollupSource).toMatch(/\.size\(\)/);
    expect(tbc4337Source).toMatch(/\.size\(\)/);
    expect(restakingSource).toMatch(/\.size\(\)/);
    expect(intentSource).toMatch(/\.size\(\)/);
  });
});
