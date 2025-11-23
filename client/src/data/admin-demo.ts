// Demo data for admin panel when API is unavailable
export const DEMO_STATS = {
  currentBlockHeight: 12345678,
  tps: 520000,
  peakTps: 520000,
  validators: 100,
  totalTransactions: "987654321"
};

export const DEMO_BLOCKS = [
  {
    height: 12345678,
    hash: "0xdemo...001",
    timestamp: Math.floor(Date.now() / 1000) - 3,
    transactionCount: 1250,
    validator: "DEMO_VALIDATOR_01",
    size: 256000
  },
  {
    height: 12345677,
    hash: "0xdemo...002",
    timestamp: Math.floor(Date.now() / 1000) - 6,
    transactionCount: 1180,
    validator: "DEMO_VALIDATOR_02",
    size: 248000
  },
  {
    height: 12345676,
    hash: "0xdemo...003",
    timestamp: Math.floor(Date.now() / 1000) - 9,
    transactionCount: 1320,
    validator: "DEMO_VALIDATOR_03",
    size: 265000
  }
];

export const DEMO_HEALTH = {
  healthy: true,
  blockProduction: "active",
  consensusActive: true,
  validatorCount: 100,
  networkLatency: 45,
  peakTps: 520000
};