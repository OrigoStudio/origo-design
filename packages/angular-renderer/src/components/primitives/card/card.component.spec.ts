import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';
import { provideZonelessChangeDetection } from '@angular/core';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
  });

  it('should create and render with valid contract', () => {
    fixture.componentRef.setInput('contract', {
      id: 'card-1',
      type: 'Card',
      props: {
        title: 'Card Title',
        subtitle: 'Card Subtitle',
        imageUrl: 'http://example.com/image.png',
        'aria-label': 'My card',
        'aria-describedby': 'desc-1',
      },
    });
    fixture.detectChanges();

    expect(component).toBeTruthy();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('data-testid')).toBe('card-1');
    expect(host.getAttribute('aria-label')).toBe('My card');
    expect(host.getAttribute('aria-describedby')).toBe('desc-1');

    const root = host.shadowRoot!;
    const titleEl = root.querySelector('.origo-card-title');
    expect(titleEl?.textContent?.trim()).toBe('Card Title');

    const subtitleEl = root.querySelector('.origo-card-subtitle');
    expect(subtitleEl?.textContent?.trim()).toBe('Card Subtitle');

    const imgEl = root.querySelector('img');
    expect(imgEl?.getAttribute('src')).toBe('http://example.com/image.png');
  });

  it('should not crash with null/undefined props', () => {
    fixture.componentRef.setInput('contract', {
      id: 'card-err',
      type: 'Card',
      props: null,
    });
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should sanitize imageUrl', () => {
    fixture.componentRef.setInput('contract', {
      id: 'card-sanit',
      type: 'Card',
      props: {
        imageUrl: 'javascript:alert(1)',
      },
    });
    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot!;
    const imgEl = root.querySelector('img');
    // Angular URL sanitization should prefix unsafe urls with 'unsafe:' or strip them
    const src = imgEl?.getAttribute('src') || '';
    expect(src).toBe('unsafe:javascript:alert(1)');
  });
});
