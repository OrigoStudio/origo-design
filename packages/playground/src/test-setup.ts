import '@analogjs/vite-plugin-angular/setup-vitest';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// Manual initialization just in case setup-vitest fails
try {
  getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
} catch (e) {
  if (!(e as Error).message.includes('has already been')) {
    throw e;
  }
}

// Monaco editor requires document.queryCommandSupported in jsdom
if (typeof document !== 'undefined') {
  document.queryCommandSupported = () => false;
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value:
      window.matchMedia ||
      function () {
        return {
          matches: false,
          addListener: function () {
            /* noop */
          },
          removeListener: function () {
            /* noop */
          },
          addEventListener: function () {
            /* noop */
          },
          removeEventListener: function () {
            /* noop */
          },
          dispatchEvent: function () {
            return false;
          },
        };
      },
  });

  HTMLCanvasElement.prototype.getContext = function () {
    return {
      fillRect: function () {
        /* noop */
      },
      clearRect: function () {
        /* noop */
      },
      getImageData: function (x: number, y: number, w: number, h: number) {
        return { data: new Array(w * h * 4) };
      },
      putImageData: function () {
        /* noop */
      },
      createImageData: function () {
        return [];
      },
      setTransform: function () {
        /* noop */
      },
      drawImage: function () {
        /* noop */
      },
      save: function () {
        /* noop */
      },
      fillText: function () {
        /* noop */
      },
      restore: function () {
        /* noop */
      },
      beginPath: function () {
        /* noop */
      },
      moveTo: function () {
        /* noop */
      },
      lineTo: function () {
        /* noop */
      },
      closePath: function () {
        /* noop */
      },
      stroke: function () {
        /* noop */
      },
      translate: function () {
        /* noop */
      },
      scale: function () {
        /* noop */
      },
      rotate: function () {
        /* noop */
      },
      arc: function () {
        /* noop */
      },
      fill: function () {
        /* noop */
      },
      measureText: function () {
        return { width: 0 };
      },
      transform: function () {
        /* noop */
      },
      rect: function () {
        /* noop */
      },
      clip: function () {
        /* noop */
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  };

  class ResizeObserverMock {
    observe() {
      /* noop */
    }
    unobserve() {
      /* noop */
    }
    disconnect() {
      /* noop */
    }
  }
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: ResizeObserverMock,
  });
}
