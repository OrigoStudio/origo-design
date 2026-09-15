import type {
  MetadataSource,
  ResolutionChain,
  RenderingPath,
  ErrorContext,
} from '@origo/angular-renderer';

export type DevToolsMessageType =
  | 'GET_METADATA_SOURCE'
  | 'METADATA_SOURCE_RESPONSE'
  | 'GET_RESOLUTION_CHAIN'
  | 'RESOLUTION_CHAIN_RESPONSE'
  | 'GET_RENDERING_PATH'
  | 'RENDERING_PATH_RESPONSE'
  | 'GET_ERROR_TELEMETRY'
  | 'ERROR_TELEMETRY_RESPONSE'
  | 'GET_ACTIVE_STATE'
  | 'ACTIVE_STATE_RESPONSE'
  | 'PING'
  | 'PONG'
  | 'NOT_AVAILABLE'
  | 'CONNECTION_LOST';

export interface BaseMessage {
  type: DevToolsMessageType;
  payload?: any;
}

export interface GetMetadataSourceMessage extends BaseMessage {
  type: 'GET_METADATA_SOURCE';
  payload: { badlPath: string };
}

export interface MetadataSourceResponseMessage extends BaseMessage {
  type: 'METADATA_SOURCE_RESPONSE';
  payload: MetadataSource | null;
}

export interface GetResolutionChainMessage extends BaseMessage {
  type: 'GET_RESOLUTION_CHAIN';
  payload: { badlPath: string };
}

export interface ResolutionChainResponseMessage extends BaseMessage {
  type: 'RESOLUTION_CHAIN_RESPONSE';
  payload: ResolutionChain | null;
}

export interface GetRenderingPathMessage extends BaseMessage {
  type: 'GET_RENDERING_PATH';
  payload: { badlPath: string };
}

export interface RenderingPathResponseMessage extends BaseMessage {
  type: 'RENDERING_PATH_RESPONSE';
  payload: RenderingPath | null;
}

export interface GetErrorTelemetryMessage extends BaseMessage {
  type: 'GET_ERROR_TELEMETRY';
}

export interface ErrorTelemetryResponseMessage extends BaseMessage {
  type: 'ERROR_TELEMETRY_RESPONSE';
  payload: ErrorContext[] | null;
}

export interface GetActiveStateMessage extends BaseMessage {
  type: 'GET_ACTIVE_STATE';
}

export interface ActiveStateResponseMessage extends BaseMessage {
  type: 'ACTIVE_STATE_RESPONSE';
  payload: unknown;
}

export interface PingMessage extends BaseMessage {
  type: 'PING';
}

export interface PongMessage extends BaseMessage {
  type: 'PONG';
}

export type DevToolsMessage =
  | GetMetadataSourceMessage
  | MetadataSourceResponseMessage
  | GetResolutionChainMessage
  | ResolutionChainResponseMessage
  | GetRenderingPathMessage
  | RenderingPathResponseMessage
  | GetErrorTelemetryMessage
  | ErrorTelemetryResponseMessage
  | GetActiveStateMessage
  | ActiveStateResponseMessage
  | PingMessage
  | PongMessage
  | { type: 'NOT_AVAILABLE' }
  | { type: 'CONNECTION_LOST' };
