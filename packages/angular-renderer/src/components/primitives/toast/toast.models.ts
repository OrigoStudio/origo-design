export type ToastSeverity = 'info' | 'success' | 'warn' | 'warning' | 'error';

export type ToastPosition =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center';

export interface ToastMessage {
  id?: string;
  severity?: ToastSeverity;
  summary?: string;
  detail?: string;
  content?: string;
  message?: string;
  icon?: string;
  life?: number;
  closable?: boolean;
  sticky?: boolean;
  data?: unknown;
  group?: string;
}

export interface ToastProps {
  messages?: ToastMessage[];
  position?: ToastPosition;
  life?: number;
  closable?: boolean;
  preventDuplicates?: boolean;
  group?: string;
  severity?: string;
  summary?: string;
  detail?: string;
  message?: string;
  icon?: string;
  sticky?: boolean;
  breakpoints?: Record<string, { width: string }>;
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const ToastContractSchema = {
  messages: 'array',
  position: 'string',
  life: 'number',
  closable: 'boolean',
  preventDuplicates: 'boolean',
  group: 'string',
  severity: 'string',
  summary: 'string',
  detail: 'string',
  message: 'string',
  icon: 'string',
  sticky: 'boolean',
  breakpoints: 'object',
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
} as const;
