/* eslint-disable @typescript-eslint/no-non-null-assertion */
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

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const imgEl = root.querySelector('img');
    // Angular URL sanitization should prefix unsafe urls with 'unsafe:' or strip them
    const src = imgEl?.getAttribute('src') || '';
    expect(src).toBe('unsafe:javascript:alert(1)');
  });

  it('should support RTL layouts by avoiding physical CSS properties', () => {
    fixture.componentRef.setInput('contract', { id: 'rtl-test', type: 'test', props: {} });
    fixture.detectChanges();
    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const element = root.firstElementChild as HTMLElement;
    if (element && element.style) {
      expect(element.style.paddingLeft).toBeFalsy();
      expect(element.style.paddingRight).toBeFalsy();
      expect(element.style.marginLeft).toBeFalsy();
      expect(element.style.marginRight).toBeFalsy();
    }
  });

  it('should provide viewContainerRef as vc', () => {
    fixture.componentRef.setInput('contract', { id: 'test', type: 'Card', props: {} });
    fixture.detectChanges();
    expect(component.vc()).toBeDefined();
  });

  it('should apply elevation classes', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test',
      type: 'Card',
      props: { elevation: 'md' },
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.classList.contains('origo-card--elevation-md')).toBe(true);
  });

  it('should emit click on Enter when clickable', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test',
      type: 'Card',
      props: { clickable: true },
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('tabindex')).toBe('0');
    expect(fixture.nativeElement.getAttribute('role')).toBe('article');

    let clicked = false;
    fixture.nativeElement.addEventListener('click', () => (clicked = true));

    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    fixture.nativeElement.dispatchEvent(event);

    expect(clicked).toBe(true);
  });
});
