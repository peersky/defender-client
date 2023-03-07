export type SentinelConfirmation = number | 'safe' | 'finalized';

export interface PreviousAutotaskRunInfo {
  trigger: 'schedule' | 'webhook' | 'sentinel' | 'monitor-filter' | 'scenario' | 'manual' | 'manual-api';
  status: 'pending' | 'throttled' | 'error' | 'success';
  createdAt: string;
  autotaskId: string;
  message?: string;
  autotaskRunId: 'string';
}

/**
 * Event information injected by Defender when invoking an Autotask
 */
export interface AutotaskEvent {
  /**
   * Internal identifier of the relayer function used by the relay-client
   */
  relayerARN?: string;

  /**
   * Internal identifier of the key-value store function used by the kvstore-client
   */
  kvstoreARN?: string;

  /**
   * Internal credentials generated by Defender for communicating with other services
   */
  credentials?: string;

  /**
   * Read-only key-value secrets defined in the Autotask secrets vault
   */
  secrets?: AutotaskSecretsMap;

  /**
   * Contains a Webhook request, Sentinel match information, or Sentinel match request
   */
  request?: AutotaskRequestData;
  /**
   * autotaskId is the unique identifier of the Autotask
   */
  autotaskId: string;
  /**
   * Name assigned to the Autotask
   */
  autotaskName: string;
  /**
   * Id of the the current Autotask run
   */
  autotaskRunId: string;
  /**
   * Previous Autotask run information
   */
  previousRun?: PreviousAutotaskRunInfo;
}

/**
 * Key-value secrets defined in the Autotask secrets vault
 */
export interface AutotaskSecretsMap {
  [k: string]: string;
}

/**
 * Autotask request data injected by Defender based on the type of trigger
 */
export interface AutotaskRequestData {
  /**
   * Main payload of the request: can be a generic object for a webhook request, or a typed request from Sentinels
   */
  body?: SentinelConditionRequest | SentinelTriggerEvent | Record<string, unknown>;

  /**
   * Query parameters of the webhook request
   */
  queryParameters?: { [name: string]: string };

  /**
   * HTTP headers parameters of the webhook request (only headers starting with 'X-' are received)
   */
  headers?: { [name: string]: string };
}

/**
 * Payload injected by a Sentinel when using an Autotask as a condition.
 *
 * Note that the Autotask should return a SentinelConditionResponse corresponding to the matched txs.
 */
export interface SentinelConditionRequest {
  /**
   * All potential matches to be evaluated by the autotask
   */
  events: SentinelTriggerEvent[];
}

/**
 * To be returned by an Autotask when invoked as a Sentinel condition via a SentinelConditionRequest to refine a match
 */
export interface SentinelConditionResponse {
  /**
   * List of matches to be triggered by the Sentinel, must be included in the SentinelConditionRequest
   */
  matches: SentinelConditionMatch[];
}

/**
 * Match to be triggered by the Sentinel
 */
export interface SentinelConditionMatch {
  /**
   * Hash of the transaction to match
   */
  hash: string;

  /**
   * Optional user-defined metadata to include with the Sentinel notification
   */
  metadata?: { [k: string]: unknown };
}

/**
 * Represents an object matched by a Sentinel
 */
export type SentinelTriggerEvent = BlockTriggerEvent | FortaTriggerEvent;

export interface BlockTriggerEvent {
  type: 'BLOCK';
  hash: string;
  timestamp: number;
  blockNumber: string;
  blockHash: string;
  transaction: EthReceipt;
  matchReasons: SentinelConditionSummary[];
  matchedAddresses: string[];
  sentinel: BlockSubscriberSummary;
  metadata?: { [k: string]: unknown };
}

export interface FortaTriggerEvent {
  type: 'FORTA';
  hash: string;
  alert: FortaAlert;
  matchReasons: FortaConditionSummary[];
  sentinel: FortaSubscriberSummary;
  metadata?: { [k: string]: unknown };
}

/**
 * Summary of a Sentinel definition
 */
export type SentinelSubscriberSummary = FortaSubscriberSummary | BlockSubscriberSummary;

export interface BlockSubscriberSummary {
  id: string;
  name: string;
  network: string;
  addresses: string[];
  confirmBlocks: SentinelConfirmation;
  abi: Record<string, unknown> | undefined;
  chainId: number;
}

export interface FortaSubscriberSummary {
  id: string;
  name: string;
  addresses: string[];
  // Forta have changed the terminology for 'Agent' to 'Detection Bot'
  // We will continue to refer to them as 'Agent' for now.
  // agents should be a list of Bot IDs
  agents: string[];
  network?: string;
  chainId?: number;
}

interface SentinelBaseConditionSummary {
  condition?: string;
}

interface SentinelBaseAbiConditionSummary extends SentinelBaseConditionSummary {
  signature: string;
  args: any[];
  address: string;
  params: { [key: string]: any };
}

interface EventConditionSummary extends SentinelBaseAbiConditionSummary {
  type: 'event';
}

interface FunctionConditionSummary extends SentinelBaseAbiConditionSummary {
  type: 'function';
}

interface InternalFunctionConditionSummary extends SentinelBaseAbiConditionSummary {
  type: 'internal-function';
}

interface TransactionConditionSummary extends SentinelBaseConditionSummary {
  type: 'transaction';
}

export interface AlertIdConditionSummary {
  type: 'alert-id';
  value: string;
}

export interface SeverityConditionSummary {
  type: 'severity';
  value: string;
}

/**
 * Summary of a user-defined Sentinel condition
 */
export type SentinelConditionSummary =
  | TransactionConditionSummary
  | InternalFunctionConditionSummary
  | FunctionConditionSummary
  | EventConditionSummary;

export type FortaConditionSummary = AlertIdConditionSummary | SeverityConditionSummary;
/**
 * Ethereum transaction receipt
 */
export interface EthReceipt {
  transactionHash: string;
  transactionIndex: string;
  contractAddress: string | null;
  blockHash: string;
  blockNumber: string;
  from: string;
  to: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  logs: EthLog[];
  logsBloom: string;
  status: string;
}

/**
 * Ethereum transaction event log
 */
export interface EthLog {
  address?: string;
  blockHash: string;
  blockNumber: string;
  data: string;
  logIndex: string;
  removed: boolean;
  topics: string[];
  transactionHash: string;
  transactionIndex: string;
}

/**
 * Forta Alert
 */
export type FortaAlert = TxAlert | BlockAlert;

export type TxAlert = TFortaAlert & {
  addresses: string[];
  source: Source & {
    tx_hash: string;
  };
  alertType: 'TX';
};

export type BlockAlert = TFortaAlert & {
  alertType: 'BLOCK';
};

interface TFortaAlert {
  addresses?: string[];
  createdAt: string;
  severity: string;
  alertId: string;
  scanNodeCount: number;
  name: string;
  description: string;
  hash: string;
  protocol: string;
  findingType: string;
  source: Source;
  metadata: {
    [k: string]: unknown;
  };
  alertType?: 'TX' | 'BLOCK';
}

interface Source {
  transactionHash?: string;
  // deprecated, keeping for backwards compatibility
  agent: {
    id: string;
  };
  bot: {
    id: string;
  };
  block: {
    chainId: number;
    hash: string;
  };
}

export function isTxAlert(alert: FortaAlert): alert is TxAlert {
  return (alert as TxAlert).alertType === 'TX';
}

export function isBlockAlert(alert: FortaAlert): alert is BlockAlert {
  return (alert as BlockAlert).alertType === 'BLOCK';
}

export enum AlertType {
  TX = 'TX',
  BLOCK = 'BLOCK',
}

export enum SubscriberType {
  BLOCK = 'BLOCK',
  FORTA = 'FORTA',
}
