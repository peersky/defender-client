import { Network } from 'defender-base-client';

export type SourceCodeLicense =
  | 'None'
  | 'Unlicense'
  | 'MIT'
  | 'GNU GPLv2'
  | 'GNU GPLv3'
  | 'GNU LGPLv2.1'
  | 'GNU LGPLv3'
  | 'BSD-2-Clause'
  | 'BSD-3-Clause'
  | 'MPL-2.0'
  | 'OSL-3.0'
  | 'Apache-2.0'
  | 'GNU AGPLv3'
  | 'BSL 1.1';

export interface DeployContractRequest {
  contractName: string;
  contractPath: string;
  network: Network;
  verifySourceCode: boolean;
  artifactPayload?: string;
  artifactUri?: string;
  value?: string;
  salt?: string;
  licenseType?: SourceCodeLicense;
  libraries?: {
    [k: string]: string;
  };
  constructorInputs?: string[];
}

export interface DeploymentResponse {
  deploymentId: string;
  createdAt: string;
  contractName?: string;
  network: Network;
  relayerId: string;
  address: Address;
  status: string;
  transactionId: string;
  txHash: string;
  abi: string;
  bytecode: string;
  value: string;
  salt: string;
  constructorInputs?: string[];
}

export interface DeploymentConfigCreateRequest {
  relayerId: string;
}

export interface DeploymentConfigResponse {
  deploymentConfigId: string;
  relayerId: string;
  network: Network;
  createdAt: string;
}

export interface CreateBlockExplorerApiKeyRequest {
  key: string;
  network: Network;
}

export interface BlockExplorerApiKeyResponse {
  blockExplorerApiKeyId: string;
  createdAt: string;
  key: string;
  network: Network;
}

export type Address = string;

export interface RemoveResponse {
  message: string;
}