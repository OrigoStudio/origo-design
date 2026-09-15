import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockPort: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    mockPort = {
      postMessage: vi.fn(),
      onMessage: { addListener: vi.fn() },
      onDisconnect: { addListener: vi.fn() },
      disconnect: vi.fn(),
    };

    global.chrome = {
      runtime: {
        connect: vi.fn().mockReturnValue(mockPort),
      },
      devtools: {
        inspectedWindow: {
          tabId: 123,
        },
      },
    } as any;

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (global as any).chrome;
  });

  it('should initialize connection on init', () => {
    expect(chrome.runtime.connect).toHaveBeenCalledWith({
      name: 'origo-devtools-panel',
    });
  });

  it('should have INITIALIZING state initially', () => {
    expect(component.connectionState()).toBe('INITIALIZING');
  });

  it('should transition to CONNECTED on PONG', () => {
    const listener = mockPort.onMessage.addListener.mock.calls[0][0];
    listener({ source: 'origo-devtools-injected', payload: { type: 'PONG' } });
    expect(component.connectionState()).toBe('CONNECTED');
    expect(mockPort.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { type: 'GET_RENDERING_PATH', payload: { badlPath: '' } },
      })
    );
  });

  it('should transition to CONNECTION_LOST on disconnect', () => {
    const listener = mockPort.onDisconnect.addListener.mock.calls[0][0];
    listener();
    expect(component.connectionState()).toBe('CONNECTION_LOST');
  });
});
