import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { vi } from 'vitest';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    // Mock chrome connection
    global.chrome.runtime.connect = vi.fn().mockReturnValue({
      postMessage: vi.fn(),
      onMessage: { addListener: vi.fn() },
      onDisconnect: { addListener: vi.fn() },
    });

    fixture.detectChanges();
  });

  it('should initialize connection on init', () => {
    expect(chrome.runtime.connect).toHaveBeenCalledWith({
      name: 'origo-devtools-panel',
    });
  });

  it('should have INITIALIZING state initially', () => {
    expect(component.connectionState()).toBe('INITIALIZING');
  });
});
