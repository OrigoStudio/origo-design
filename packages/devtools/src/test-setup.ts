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

afterEach(() => {
  getTestBed().resetTestingModule();
});

// Mock chrome API for tests
global.chrome = {
  runtime: {
    connect: vi.fn(),
    sendMessage: vi.fn(),
    onConnect: {
      addListener: vi.fn(),
    },
    onMessage: {
      addListener: vi.fn(),
    },
    getURL: vi.fn(),
  },
  tabs: {
    sendMessage: vi.fn(),
  },
  devtools: {
    panels: {
      create: vi.fn(),
    },
    inspectedWindow: {
      tabId: 123,
    },
  },
} as unknown;
