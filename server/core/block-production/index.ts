/**
 * Block Production Module
 * Enterprise-grade 100ms block production with state transitions
 */

export {
  EnterpriseBlockEngine,
  getEnterpriseBlockEngine,
  resetEnterpriseBlockEngine,
  BlockState,
  CircuitState,
  type BlockProducerConfig,
  type ProducedBlock,
  type BlockProductionMetrics,
  type StateTransitionEvent
} from './enterprise-block-engine';
