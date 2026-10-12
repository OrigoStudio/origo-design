import { Injectable, inject, PLATFORM_ID, DestroyRef, ElementRef } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import {
  Overlay,
  OverlayConfig as CdkOverlayConfig,
  ConnectedPosition,
  PositionStrategy,
} from '@angular/cdk/overlay';
import {
  OrigoConnectedPositionConfig,
  OrigoGlobalPositionConfig,
  OrigoOverlayConfig,
  OrigoOverlayRef,
} from './overlay.models';
import { OrigoNoopOverlayRef, OrigoOverlayRefImpl } from './overlay-ref';

let overlayIdCounter = 0;

@Injectable({
  providedIn: 'root',
})
export class OrigoOverlayService {
  private readonly overlay = inject(Overlay, { optional: true });
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  create<T = unknown>(config: OrigoOverlayConfig, destroyRef?: DestroyRef): OrigoOverlayRef<T> {
    const id = `origo-overlay-${++overlayIdCounter}`;

    if (!this.isBrowser || !this.overlay) {
      return new OrigoNoopOverlayRef<T>(id);
    }

    const positionStrategy = this.buildPositionStrategy(config.position);
    const panelClasses = this.resolvePanelClasses(config);
    const direction = this.resolveDirection(config);

    const cdkConfig = new CdkOverlayConfig({
      positionStrategy,
      hasBackdrop: config.hasBackdrop ?? false,
      backdropClass: config.backdropClass
        ? ['origo-overlay-backdrop', config.backdropClass]
        : 'origo-overlay-backdrop',
      panelClass: panelClasses,
      direction,
      width: config.position.type === 'global' ? config.position.width : undefined,
      height: config.position.type === 'global' ? config.position.height : undefined,
      minWidth: config.position.type === 'global' ? config.position.minWidth : undefined,
      minHeight: config.position.type === 'global' ? config.position.minHeight : undefined,
      maxWidth: config.position.type === 'global' ? config.position.maxWidth : undefined,
      maxHeight: config.position.type === 'global' ? config.position.maxHeight : undefined,
      disposeOnNavigation: true,
    });

    const cdkOverlayRef = this.overlay.create(cdkConfig);

    return new OrigoOverlayRefImpl<T>(id, cdkOverlayRef, config, this.document, destroyRef);
  }

  private buildPositionStrategy(
    positionConfig: OrigoConnectedPositionConfig | OrigoGlobalPositionConfig
  ): PositionStrategy {
    if (!this.overlay) {
      throw new Error('CDK Overlay is not available');
    }

    if (positionConfig.type === 'connected') {
      const targetEl =
        positionConfig.target instanceof ElementRef
          ? positionConfig.target.nativeElement
          : positionConfig.target;

      const originX = positionConfig.originX ?? 'start';
      const originY = positionConfig.originY ?? 'bottom';
      const overlayX = positionConfig.overlayX ?? 'start';
      const overlayY = positionConfig.overlayY ?? 'top';
      const [offsetX, offsetY] = positionConfig.offset ?? [0, 4];

      // Primary position plus flip fallback positions
      const positions: ConnectedPosition[] = [
        {
          originX,
          originY,
          overlayX,
          overlayY,
          offsetX,
          offsetY,
        },
        // Inverted Y flip fallback
        {
          originX,
          originY: originY === 'bottom' ? 'top' : 'bottom',
          overlayX,
          overlayY: overlayY === 'top' ? 'bottom' : 'top',
          offsetX,
          offsetY: -offsetY,
        },
        // Inverted X flip fallback
        {
          originX: originX === 'start' ? 'end' : 'start',
          originY,
          overlayX: overlayX === 'start' ? 'end' : 'start',
          overlayY,
          offsetX: -offsetX,
          offsetY,
        },
      ];

      return this.overlay
        .position()
        .flexibleConnectedTo(targetEl)
        .withPositions(positions)
        .withPush(false);
    } else {
      const global = this.overlay.position().global();
      const pos = positionConfig.position ?? 'center';

      switch (pos) {
        case 'top':
          global.centerHorizontally().top('0');
          break;
        case 'bottom':
          global.centerHorizontally().bottom('0');
          break;
        case 'start':
          global.left('0').centerVertically();
          break;
        case 'end':
          global.right('0').centerVertically();
          break;
        case 'center':
        default:
          global.centerHorizontally().centerVertically();
          break;
      }

      if (positionConfig.width) global.width(positionConfig.width);
      if (positionConfig.height) global.height(positionConfig.height);

      return global;
    }
  }

  private resolvePanelClasses(config: OrigoOverlayConfig): string[] {
    const classes = ['origo-overlay-pane'];

    if (config.position.type === 'connected') {
      classes.push('origo-overlay-pane--connected');
    } else {
      classes.push('origo-overlay-pane--modal');
    }

    // Theme Scope Inheritance
    if (config.themeScope) {
      classes.push(config.themeScope);
    } else if (this.document) {
      // Inherit active theme class from body/documentElement if present
      if (this.document.body.classList.contains('theme-dark')) {
        classes.push('theme-dark');
      } else if (this.document.body.classList.contains('theme-light')) {
        classes.push('theme-light');
      } else if (this.document.body.classList.contains('high-contrast')) {
        classes.push('high-contrast');
      }
    }

    if (config.panelClass) {
      if (Array.isArray(config.panelClass)) {
        classes.push(...config.panelClass);
      } else {
        classes.push(config.panelClass);
      }
    }

    return classes;
  }

  private resolveDirection(config: OrigoOverlayConfig): 'ltr' | 'rtl' {
    if (config.direction) {
      return config.direction;
    }

    if (this.document) {
      const docDir = this.document.documentElement.getAttribute('dir');
      if (docDir === 'rtl') return 'rtl';

      if (config.position.type === 'connected') {
        const targetEl =
          config.position.target instanceof ElementRef
            ? config.position.target.nativeElement
            : config.position.target;
        if (targetEl && typeof targetEl.closest === 'function') {
          const dirEl = targetEl.closest('[dir]');
          if (dirEl && dirEl.getAttribute('dir') === 'rtl') {
            return 'rtl';
          }
        }
      }
    }

    return 'ltr';
  }
}
