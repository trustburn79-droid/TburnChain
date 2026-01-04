"use strict";
/**
 * TBURN Validator Node
 * Enterprise Production-Grade Standalone Validator
 *
 * Main Entry Point
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GENESIS_VALIDATORS_REGIONS = exports.CHAIN_CONSTANTS = exports.DEFAULT_CONFIG = exports.createModuleLogger = exports.Logger = exports.startApiServer = exports.createApiRouter = exports.QuantumResistantSigner = exports.CryptoManager = exports.StateStore = exports.BlockStore = exports.MessageType = exports.P2PNetwork = exports.BFTConsensusEngine = exports.ValidatorNode = void 0;
exports.createValidatorNode = createValidatorNode;
exports.startValidator = startValidator;
var validator_node_1 = require("./core/validator-node");
Object.defineProperty(exports, "ValidatorNode", { enumerable: true, get: function () { return validator_node_1.ValidatorNode; } });
var bft_engine_1 = require("./consensus/bft-engine");
Object.defineProperty(exports, "BFTConsensusEngine", { enumerable: true, get: function () { return bft_engine_1.BFTConsensusEngine; } });
var p2p_1 = require("./network/p2p");
Object.defineProperty(exports, "P2PNetwork", { enumerable: true, get: function () { return p2p_1.P2PNetwork; } });
Object.defineProperty(exports, "MessageType", { enumerable: true, get: function () { return p2p_1.MessageType; } });
var block_store_1 = require("./storage/block-store");
Object.defineProperty(exports, "BlockStore", { enumerable: true, get: function () { return block_store_1.BlockStore; } });
Object.defineProperty(exports, "StateStore", { enumerable: true, get: function () { return block_store_1.StateStore; } });
var keys_1 = require("./crypto/keys");
Object.defineProperty(exports, "CryptoManager", { enumerable: true, get: function () { return keys_1.CryptoManager; } });
Object.defineProperty(exports, "QuantumResistantSigner", { enumerable: true, get: function () { return keys_1.QuantumResistantSigner; } });
var routes_1 = require("./api/routes");
Object.defineProperty(exports, "createApiRouter", { enumerable: true, get: function () { return routes_1.createApiRouter; } });
Object.defineProperty(exports, "startApiServer", { enumerable: true, get: function () { return routes_1.startApiServer; } });
var logger_1 = require("./utils/logger");
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return logger_1.Logger; } });
Object.defineProperty(exports, "createModuleLogger", { enumerable: true, get: function () { return logger_1.createModuleLogger; } });
var default_1 = require("./config/default");
Object.defineProperty(exports, "DEFAULT_CONFIG", { enumerable: true, get: function () { return default_1.DEFAULT_CONFIG; } });
Object.defineProperty(exports, "CHAIN_CONSTANTS", { enumerable: true, get: function () { return default_1.CHAIN_CONSTANTS; } });
Object.defineProperty(exports, "GENESIS_VALIDATORS_REGIONS", { enumerable: true, get: function () { return default_1.GENESIS_VALIDATORS_REGIONS; } });
__exportStar(require("./config/types"), exports);
const validator_node_2 = require("./core/validator-node");
const routes_2 = require("./api/routes");
const default_2 = require("./config/default");
const keys_2 = require("./crypto/keys");
async function createValidatorNode(customConfig) {
    const keyPair = keys_2.CryptoManager.generateKeyPair();
    const config = {
        ...default_2.DEFAULT_CONFIG,
        validator: {
            address: keyPair.address,
            privateKey: keyPair.privateKey,
            publicKey: keyPair.publicKey,
            stake: '1000000000000000000000000',
            commission: 0.1,
            name: 'TBURN Validator',
            description: 'TBURN Mainnet Validator Node',
        },
        ...customConfig,
    };
    const node = new validator_node_2.ValidatorNode(config);
    if (config.api.enabled) {
        (0, routes_2.startApiServer)(node, config.api);
    }
    return node;
}
async function startValidator(configPath) {
    let config;
    if (configPath) {
        const fs = await Promise.resolve().then(() => __importStar(require('fs')));
        const configData = fs.readFileSync(configPath, 'utf-8');
        config = JSON.parse(configData);
    }
    else {
        const keyPair = keys_2.CryptoManager.generateKeyPair();
        config = {
            ...default_2.DEFAULT_CONFIG,
            validator: {
                address: keyPair.address,
                privateKey: keyPair.privateKey,
                publicKey: keyPair.publicKey,
                stake: '1000000000000000000000000',
                commission: 0.1,
                name: 'TBURN Validator',
                description: 'TBURN Mainnet Validator Node',
            },
        };
    }
    const node = new validator_node_2.ValidatorNode(config);
    if (config.api.enabled) {
        (0, routes_2.startApiServer)(node, config.api);
    }
    await node.start();
    return node;
}
//# sourceMappingURL=index.js.map