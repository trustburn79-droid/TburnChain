/**
 * TBURN Validator Node API Routes
 * Enterprise-Grade REST API for Validator Management
 */
import { Router } from 'express';
import { ValidatorNode } from '../core/validator-node';
import { ApiConfig } from '../config/types';
export declare function createApiRouter(node: ValidatorNode, config: ApiConfig): Router;
export declare function startApiServer(node: ValidatorNode, config: ApiConfig): void;
//# sourceMappingURL=routes.d.ts.map