"use strict";
/**
 * TBURN Validator Node Configuration Types
 * Enterprise Production-Grade Type Definitions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsensusPhase = void 0;
var ConsensusPhase;
(function (ConsensusPhase) {
    ConsensusPhase[ConsensusPhase["IDLE"] = 0] = "IDLE";
    ConsensusPhase[ConsensusPhase["PROPOSE"] = 1] = "PROPOSE";
    ConsensusPhase[ConsensusPhase["PREVOTE"] = 2] = "PREVOTE";
    ConsensusPhase[ConsensusPhase["PRECOMMIT"] = 3] = "PRECOMMIT";
    ConsensusPhase[ConsensusPhase["COMMIT"] = 4] = "COMMIT";
    ConsensusPhase[ConsensusPhase["FINALIZE"] = 5] = "FINALIZE";
})(ConsensusPhase || (exports.ConsensusPhase = ConsensusPhase = {}));
//# sourceMappingURL=types.js.map