import '@angular/compiler';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

afterEach(() => {
  getTestBed().resetTestingModule();
  jest.clearAllMocks();
  jest.restoreAllMocks();
  if (typeof document !== 'undefined') {
    document.body.innerHTML = '';
  }
});
