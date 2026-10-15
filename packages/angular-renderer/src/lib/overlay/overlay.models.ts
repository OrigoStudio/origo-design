import { ElementRef, TemplateRef, Type, ViewContainerRef } from '@angular/core';

export type OrigoOverlayOriginX = 'start' | 'end' | 'center';
export type OrigoOverlayOriginY = 'top' | 'bottom' | 'center';
export type OrigoGlobalPositionAlignment =
  | 'center'
  | 'top'
  | 'bottom'
  | 'start'
  | 'end'
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface OrigoConnectedPositionConfig {
  type: 'connected';
  target: ElementRef<HTMLElement> | HTMLElement;
  originX?: OrigoOverlayOriginX;
  originY?: OrigoOverlayOriginY;
  overlayX?: OrigoOverlayOriginX;
  overlayY?: OrigoOverlayOriginY;
  offset?: [number, number]; // [offsetX, offsetY] in pixels
  autoRepositionOnResize?: boolean;
}

export interface OrigoGlobalPositionConfig {
  type: 'global';
  position?: OrigoGlobalPositionAlignment;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
}

export type OrigoOverlayPosition = OrigoConnectedPositionConfig | OrigoGlobalPositionConfig;

export type OrigoConnectedPositionStrategy = OrigoConnectedPositionConfig;
export type OrigoGlobalPositionStrategy = OrigoGlobalPositionConfig;
export type OrigoOverlayPositionStrategy = OrigoOverlayPosition;

export type OrigoOverlayContent<C = unknown> = TemplateRef<C> | Type<unknown>;

export interface OrigoOverlayConfig {
  position: OrigoOverlayPosition;
  hasBackdrop?: boolean;
  backdropClass?: string;
  panelClass?: string | string[];
  closeOnBackdropClick?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  trapFocus?: boolean;
  viewContainerRef?: ViewContainerRef;
  direction?: 'ltr' | 'rtl';
  themeScope?: string;
}

export interface OrigoOverlayRef<T = unknown> {
  readonly id: string;
  readonly isOpen: boolean;
  open(content?: OrigoOverlayContent, viewContainerRef?: ViewContainerRef): void;
  close(result?: T): void;
  afterClosed(): Promise<T | undefined>;
  updatePosition(): void;
  addPanelClass?(classes: string | string[]): void;
  removePanelClass?(classes: string | string[]): void;
  updateSize?(sizeConfig: {
    width?: string | number;
    height?: string | number;
    minWidth?: string | number;
    minHeight?: string | number;
    maxWidth?: string | number;
    maxHeight?: string | number;
  }): void;
  dispose(): void;
}
