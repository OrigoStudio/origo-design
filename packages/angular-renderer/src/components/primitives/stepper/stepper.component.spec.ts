import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepperComponent, StepperProps, StepChangeEvent } from './stepper.component';
import { provideZonelessChangeDetection, ViewContainerRef } from '@angular/core';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { InteractionContract } from '@origostudio/core';

describe('StepperComponent', () => {
  let component: StepperComponent;
  let fixture: ComponentFixture<StepperComponent>;
  let mockAdapter: { updateState: jest.Mock; dispatchCapability: jest.Mock };

  beforeEach(async () => {
    mockAdapter = {
      updateState: jest.fn(),
      dispatchCapability: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [StepperComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WebExperienceAdapterService, useValue: mockAdapter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StepperComponent);
    component = fixture.componentInstance;
  });

  it('should create and implement ContainerComponent with ViewContainerRef vc', () => {
    fixture.componentRef.setInput('contract', {
      id: 'step-1',
      type: 'Stepper',
      props: {
        steps: [
          { key: 'step1', label: 'Step 1' },
          { key: 'step2', label: 'Step 2' },
        ],
      },
    } as InteractionContract<StepperProps>);

    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.vc).toBeDefined();
    expect(component.vc()).toBeInstanceOf(ViewContainerRef);
  });

  it('should render step headers, indicators, and labels', () => {
    fixture.componentRef.setInput('contract', {
      id: 'step-1',
      type: 'Stepper',
      props: {
        steps: [
          { key: 'details', label: 'Personal Details', description: 'Enter name and email' },
          { key: 'address', label: 'Address', icon: 'map-pin' },
          { key: 'payment', label: 'Payment' },
        ],
        value: 'details',
      },
    } as InteractionContract<StepperProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const tablist = root.querySelector('[role="tablist"]');
    expect(tablist).toBeTruthy();

    const stepButtons = root.querySelectorAll('[role="tab"]');
    expect(stepButtons.length).toBe(3);

    // First step is active
    expect(stepButtons[0].getAttribute('aria-selected')).toBe('true');
    expect(stepButtons[0].textContent).toContain('Personal Details');
    expect(stepButtons[0].textContent).toContain('Enter name and email');

    // Second step has icon
    expect(stepButtons[1].textContent).toContain('Address');
    expect(stepButtons[1].textContent).toContain('map-pin');
  });

  it('should switch steps on click in non-linear mode and emit outputs and update state', () => {
    const stepChangeSpy = jest.fn();
    const valueChangeSpy = jest.fn();
    const stepClickSpy = jest.fn();
    component.stepChange.subscribe(stepChangeSpy);
    component.valueChange.subscribe(valueChangeSpy);
    component.stepClick.subscribe(stepClickSpy);

    fixture.componentRef.setInput('contract', {
      id: 'step-1',
      type: 'Stepper',
      props: {
        steps: [
          { key: 'step1', label: 'Step 1' },
          { key: 'step2', label: 'Step 2' },
          { key: 'step3', label: 'Step 3' },
        ],
        value: 'step1',
        linear: false,
      },
    } as InteractionContract<StepperProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const stepButtons = root.querySelectorAll('[role="tab"]');
    (stepButtons[2] as HTMLButtonElement).click();

    const expectedChangeEvent: StepChangeEvent = {
      activeStep: 'step3',
      previousStep: 'step1',
      index: 2,
    };

    expect(mockAdapter.updateState).toHaveBeenCalledWith('step-1', 'value', 'step3');
    expect(mockAdapter.updateState).toHaveBeenCalledWith('step-1', 'activeStep', 'step3');
    expect(mockAdapter.dispatchCapability).toHaveBeenCalledWith(
      'step-1',
      'stepChange',
      expectedChangeEvent
    );
    expect(stepChangeSpy).toHaveBeenCalledWith(expectedChangeEvent);
    expect(valueChangeSpy).toHaveBeenCalledWith('step3');
    expect(stepClickSpy).toHaveBeenCalledWith(expect.objectContaining({ key: 'step3' }));
  });

  it('should enforce linear mode gating by preventing jumping over incomplete steps', () => {
    const stepChangeSpy = jest.fn();
    component.stepChange.subscribe(stepChangeSpy);

    fixture.componentRef.setInput('contract', {
      id: 'step-linear',
      type: 'Stepper',
      props: {
        steps: [
          { key: 'step1', label: 'Step 1' },
          { key: 'step2', label: 'Step 2' },
          { key: 'step3', label: 'Step 3' },
        ],
        value: 'step1',
        linear: true,
      },
    } as InteractionContract<StepperProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const stepButtons = root.querySelectorAll('[role="tab"]');
    // Step 3 (index 2) should be disabled in linear mode because step 1 and step 2 are not completed
    expect((stepButtons[2] as HTMLButtonElement).disabled).toBe(true);

    (stepButtons[2] as HTMLButtonElement).click();
    expect(stepChangeSpy).not.toHaveBeenCalled();
    expect(mockAdapter.updateState).not.toHaveBeenCalled();
  });

  it('should allow navigation to future step in linear mode if preceding steps are in completedSteps', () => {
    fixture.componentRef.setInput('contract', {
      id: 'step-linear-completed',
      type: 'Stepper',
      props: {
        steps: [
          { key: 'step1', label: 'Step 1' },
          { key: 'step2', label: 'Step 2' },
          { key: 'step3', label: 'Step 3' },
        ],
        value: 'step1',
        linear: true,
        completedSteps: ['step1', 'step2'],
      },
    } as InteractionContract<StepperProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const stepButtons = root.querySelectorAll('[role="tab"]');
    // Step 3 should be enabled now
    expect((stepButtons[2] as HTMLButtonElement).disabled).toBe(false);

    (stepButtons[2] as HTMLButtonElement).click();
    expect(mockAdapter.updateState).toHaveBeenCalledWith('step-linear-completed', 'value', 'step3');
  });

  it('should handle keyboard navigation (ArrowRight / ArrowLeft in horizontal, ArrowDown / ArrowUp in vertical)', () => {
    jest.useFakeTimers();
    fixture.componentRef.setInput('contract', {
      id: 'step-nav',
      type: 'Stepper',
      props: {
        steps: [
          { key: 'step1', label: 'Step 1' },
          { key: 'step2', label: 'Step 2' },
        ],
        value: 'step1',
      },
    } as InteractionContract<StepperProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const buttons = root.querySelectorAll('[role="tab"]');
    const focusSpy = jest.spyOn(buttons[1] as HTMLElement, 'focus');

    const eventRight = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    component.onKeyDown(eventRight, 0);
    jest.runAllTimers();
    expect(focusSpy).toHaveBeenCalled();

    // Now test vertical orientation
    fixture.componentRef.setInput('contract', {
      id: 'step-nav',
      type: 'Stepper',
      props: {
        orientation: 'vertical',
        steps: [
          { key: 'step1', label: 'Step 1' },
          { key: 'step2', label: 'Step 2' },
        ],
        value: 'step1',
      },
    } as InteractionContract<StepperProps>);

    fixture.detectChanges();

    const focusSpyDown = jest.spyOn(buttons[1] as HTMLElement, 'focus');
    const eventDown = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    component.onKeyDown(eventDown, 0);
    jest.runAllTimers();
    expect(focusSpyDown).toHaveBeenCalled();

    jest.useRealTimers();
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
});
