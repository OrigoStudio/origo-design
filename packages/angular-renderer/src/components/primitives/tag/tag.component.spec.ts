import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TagComponent, TagProps } from './tag.component';
import { InteractionContract } from '@origostudio/core';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

describe('TagComponent', () => {
  let component: TagComponent;
  let fixture: ComponentFixture<TagComponent>;
  let experienceAdapter: WebExperienceAdapterService;

  function createContract(
    props: Partial<TagProps> = {},
    id = 'tag-1'
  ): InteractionContract<TagProps> {
    return {
      id,
      type: 'Tag',
      props,
    };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagComponent],
      providers: [WebExperienceAdapterService],
    }).compileComponents();

    fixture = TestBed.createComponent(TagComponent);
    component = fixture.componentInstance;
    experienceAdapter = TestBed.inject(WebExperienceAdapterService);
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('should create and render label with default filled variant and primary severity', () => {
    fixture.componentRef.setInput('contract', createContract({ value: 'Feature' }));
    fixture.detectChanges();

    expect(component).toBeTruthy();
    const shadowRoot = fixture.nativeElement.shadowRoot;
    expect(shadowRoot).toBeTruthy();

    const tagEl = shadowRoot.querySelector('.origo-tag');
    expect(tagEl).toBeTruthy();
    expect(tagEl.textContent?.trim()).toBe('Feature');
    expect(tagEl.classList.contains('origo-tag--variant-filled')).toBe(true);
    expect(tagEl.classList.contains('origo-tag--severity-primary')).toBe(true);
  });

  it('should render leading icon when provided', () => {
    fixture.componentRef.setInput(
      'contract',
      createContract({ value: 'Verified', icon: 'pi-check' })
    );
    fixture.detectChanges();

    const shadowRoot = fixture.nativeElement.shadowRoot;
    const iconEl = shadowRoot.querySelector('.origo-tag__icon');
    expect(iconEl).toBeTruthy();
    expect(iconEl.classList.contains('pi-check')).toBe(true);
  });

  it('should support rounded pill shape and outlined variant', () => {
    fixture.componentRef.setInput(
      'contract',
      createContract({ value: 'Beta', rounded: true, variant: 'outlined', severity: 'warning' })
    );
    fixture.detectChanges();

    const shadowRoot = fixture.nativeElement.shadowRoot;
    const tagEl = shadowRoot.querySelector('.origo-tag');
    expect(tagEl.classList.contains('origo-tag--rounded')).toBe(true);
    expect(tagEl.classList.contains('origo-tag--variant-outlined')).toBe(true);
    expect(tagEl.classList.contains('origo-tag--severity-warning')).toBe(true);
  });

  it('should isolate remove click event from tag click event and dispatch remove capability', () => {
    const removeSpy = jest.fn();
    const clickSpy = jest.fn();
    const dispatchSpy = jest.spyOn(experienceAdapter, 'dispatchCapability');
    const updateStateSpy = jest.spyOn(experienceAdapter, 'updateState');

    component.remove.subscribe(removeSpy);
    component.click.subscribe(clickSpy);

    fixture.componentRef.setInput(
      'contract',
      createContract({ value: 'Removable Tag', removable: true, interactive: true })
    );
    fixture.detectChanges();

    const shadowRoot = fixture.nativeElement.shadowRoot;
    const removeBtn = shadowRoot.querySelector('.origo-tag__remove-btn') as HTMLButtonElement;
    expect(removeBtn).toBeTruthy();
    expect(removeBtn.getAttribute('aria-label')).toBe('Remove tag');

    removeBtn.click();
    expect(removeSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).not.toHaveBeenCalled(); // Event isolation guaranteed via stopPropagation
    expect(updateStateSpy).toHaveBeenCalledWith('tag-1', 'visible', false);
    expect(dispatchSpy).toHaveBeenCalledWith('tag-1', 'remove', expect.any(Object));
  });

  it('should emit click event and dispatch capability when interactive tag body is clicked', () => {
    const clickSpy = jest.fn();
    const dispatchSpy = jest.spyOn(experienceAdapter, 'dispatchCapability');
    component.click.subscribe(clickSpy);

    fixture.componentRef.setInput(
      'contract',
      createContract({ value: 'Clickable Tag', interactive: true })
    );
    fixture.detectChanges();

    const shadowRoot = fixture.nativeElement.shadowRoot;
    const tagEl = shadowRoot.querySelector('.origo-tag') as HTMLElement;
    expect(tagEl.getAttribute('role')).toBe('button');
    expect(tagEl.getAttribute('tabindex')).toBe('0');

    tagEl.click();
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith('tag-1', 'click', expect.any(Object));
  });

  it('should support keyboard removal with Backspace/Delete on focused tag', () => {
    const removeSpy = jest.fn();
    component.remove.subscribe(removeSpy);

    fixture.componentRef.setInput(
      'contract',
      createContract({ value: 'Key Tag', removable: true, interactive: true })
    );
    fixture.detectChanges();

    const shadowRoot = fixture.nativeElement.shadowRoot;
    const tagEl = shadowRoot.querySelector('.origo-tag') as HTMLElement;

    const event = new KeyboardEvent('keydown', { key: 'Backspace' });
    tagEl.dispatchEvent(event);
    expect(removeSpy).toHaveBeenCalledTimes(1);
  });

  it('should be safe with null or undefined props', () => {
    fixture.componentRef.setInput('contract', {
      id: 'null-tag',
      type: 'Tag',
      props: undefined as unknown as TagProps,
    });
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.displayValue()).toBe('');
  });
});
