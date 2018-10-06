"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractWrappersConfigSchema = {
    id: '/ContractWrappersConfig',
    oneOf: [{ $ref: '/ZeroExContractPrivateNetworkConfig' }, { $ref: '/ZeroExContractPublicNetworkConfig' }],
    type: 'object',
};
//# sourceMappingURL=contract_wrappers_config_schema.js.map