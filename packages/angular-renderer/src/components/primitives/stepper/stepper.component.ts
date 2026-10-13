import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
  computed,
  ViewEncapsulation,
  inject,
  ElementRef,
  viewChildren,
  viewChild,
  ViewContainerRef,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { InteractionContract } from '@origostudio/core';
import {
  OrigoAdapter,
  ContainerComponent as IContainerComponent,
  coerceContractProps,
} from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface StepItem {
  key: string;
  label: string;
  description?: string;
  icon?: string;
  optional?: boolean;
  disabled?: boolean;
  completed?: boolean;
}

export interface StepChangeEvent {
  activeStep: string;
  previousStep?: string;
  index: number;
}

export interface StepperProps {
  steps?: Array<StepItem>;
  value?: string;
  linear?: boolean;
  readonly?: boolean;
  orientation?: 'horizontal' | 'vertical';
  completedSteps?: Array<string>;
  disabled?: boolean;
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const StepperContractSchema: Record<
  keyof StepperProps,
  'string' | 'number' | 'boolean' | 'array' | 'object'
> = {
  steps: 'array',
  value: 'string',
  linear: 'boolean',
  readonly: 'boolean',
  orientation: 'string',
  completedSteps: 'array',
  disabled: 'boolean',
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
};

@Component({
  selector: 'origo-stepper',
  standalone: true,
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-stepper]': 'true',
    '[class.origo-stepper--vertical]': "orientation() === 'vertical'",
    '[attr.data-testid]': 'contract().id',
  },
})
export class StepperComponent implements OrigoAdapter<StepperProps>, IContainerComponent {
  static readonly contractSchema = StepperContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<StepperProps>>();
  vc = viewChild.required('vc', { read: ViewContainerRef });

  stepButtons = viewChildren<ElementRef<HTMLButtonElement>>('stepButton');

  valueChange = output<string>();
  stepChange = output<StepChangeEvent>();
  next = output<string>();
  previous = output<string>();
  complete = output<void>();
  stepClick = output<StepItem>();

  private experienceAdapter = inject(WebExperienceAdapterService);
  private platformId = inject(PLATFORM_ID);

  protected props = computed(() =>
    coerceContractProps<StepperProps>(this.contract().props, StepperContractSchema)
  );

  computedAriaLabel = computed(() => {
    const label = this.props()['aria-label'];
    return label !== undefined && label !== null ? String(label) : 'Stepper';
  });

  computedAriaDescribedBy = computed(() => {
    const desc = this.props()['aria-describedby'];
    return desc !== undefined && desc !== null ? String(desc) : undefined;
  });

  orientation = computed<'horizontal' | 'vertical'>(() => {
    return this.props().orientation === 'vertical' ? 'vertical' : 'horizontal';
  });

  linear = computed<boolean>(() => {
    return !!this.props().linear;
  });

  readonly = computed<boolean>(() => {
    return !!this.props().readonly;
  });

  computedDisabled = computed<boolean>(() => {
    return !!this.props().disabled;
  });

  computedSteps = computed<StepItem[]>(() => {
    const rawSteps = this.props().steps;
    if (!Array.isArray(rawSteps)) return [];

    return rawSteps
      .filter(s => s != null && s.key != null && s.label != null)
      .map(s => ({
        key: String(s.key),
        label: String(s.label),
        description: s.description ? String(s.description) : undefined,
        icon: s.icon ? String(s.icon) : undefined,
        optional: !!s.optional,
        disabled: !!s.disabled,
        completed: !!s.completed,
      }));
  });

  activeStepKey = computed<string>(() => {
    const val = this.props().value;
    if (val && typeof val === 'string') return val;

    const steps = this.computedSteps();
    return steps.length > 0 ? steps[0].key : '';
  });

  activeStepIndex = computed<number>(() => {
    const key = this.activeStepKey();
    const steps = this.computedSteps();
    const index = steps.findIndex(s => s.key === key);
    return index >= 0 ? index : 0;
  });

  completedStepKeys = computed<Set<string>>(() => {
    const set = new Set<string>();
    const rawCompleted = this.props().completedSteps;
    if (Array.isArray(rawCompleted)) {
      for (const k of rawCompleted) {
        if (k != null) set.add(String(k));
      }
    }
    for (const step of this.computedSteps()) {
      if (step.completed) {
        set.add(step.key);
      }
    }
    return set;
  });

  isStepCompleted(step: StepItem): boolean {
    return this.completedStepKeys().has(step.key);
  }

  isStepActive(index: number): boolean {
    return index === this.activeStepIndex();
  }

  isStepDisabled(step: StepItem, index: number): boolean {
    if (this.computedDisabled() || this.readonly()) return true;
    if (step.disabled) return true;

    if (!this.linear()) return false;

    // In linear mode, step at index is enabled if:
    // 1) index <= activeStepIndex
    // OR 2) all preceding steps 0..index-1 are completed
    if (index <= this.activeStepIndex()) return false;

    const steps = this.computedSteps();
    for (let i = 0; i < index; i++) {
      if (!this.isStepCompleted(steps[i])) {
        return true;
      }
    }

    return false;
  }

  onStepClick(step: StepItem, index: number) {
    if (this.isStepDisabled(step, index)) return;

    const previousStep = this.activeStepKey();
    if (previousStep === step.key) {
      this.stepClick.emit(step);
      return;
    }

    this.experienceAdapter.updateState(this.contract().id, 'value', step.key);
    this.experienceAdapter.updateState(this.contract().id, 'activeStep', step.key);

    const changeEvent: StepChangeEvent = {
      activeStep: step.key,
      previousStep,
      index,
    };

    const contractId = this.contract().id;
    if (contractId) {
      this.experienceAdapter.dispatchCapability(contractId, 'stepChange', changeEvent);
      this.experienceAdapter.dispatchCapability(contractId, 'valueChange', step.key);
      this.experienceAdapter.dispatchCapability(contractId, 'stepClick', step);
    }

    this.valueChange.emit(step.key);
    this.stepChange.emit(changeEvent);
    this.stepClick.emit(step);
  }

  goNext() {
    const steps = this.computedSteps();
    if (steps.length === 0) return;
    const currIndex = this.activeStepIndex();
    if (currIndex < steps.length - 1) {
      const nextStep = steps[currIndex + 1];
      this.onStepClick(nextStep, currIndex + 1);
      this.next.emit(nextStep.key);
    } else {
      this.complete.emit();
      const contractId = this.contract().id;
      if (contractId) {
        this.experienceAdapter.dispatchCapability(contractId, 'complete', undefined);
      }
    }
  }

  goPrevious() {
    const steps = this.computedSteps();
    const currIndex = this.activeStepIndex();
    if (currIndex > 0) {
      const prevStep = steps[currIndex - 1];
      this.onStepClick(prevStep, currIndex - 1);
      this.previous.emit(prevStep.key);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const steps = this.computedSteps();
    if (steps.length === 0) return;

    let nextIndex = index;
    const isVertical = this.orientation() === 'vertical';

    const isRtl =
      isPlatformBrowser(this.platformId) &&
      typeof window !== 'undefined' &&
      event.target instanceof Element
        ? window.getComputedStyle(event.target).direction === 'rtl'
        : false;

    if (!isVertical) {
      if (event.key === 'ArrowRight') {
        nextIndex = isRtl ? index - 1 : index + 1;
        event.preventDefault();
      } else if (event.key === 'ArrowLeft') {
        nextIndex = isRtl ? index + 1 : index - 1;
        event.preventDefault();
      } else if (event.key === 'Home') {
        nextIndex = 0;
        event.preventDefault();
      } else if (event.key === 'End') {
        nextIndex = steps.length - 1;
        event.preventDefault();
      }
    } else {
      if (event.key === 'ArrowDown') {
        nextIndex = index + 1;
        event.preventDefault();
      } else if (event.key === 'ArrowUp') {
        nextIndex = index - 1;
        event.preventDefault();
      } else if (event.key === 'Home') {
        nextIndex = 0;
        event.preventDefault();
      } else if (event.key === 'End') {
        nextIndex = steps.length - 1;
        event.preventDefault();
      }
    }

    if (nextIndex < 0) nextIndex = steps.length - 1;
    if (nextIndex >= steps.length) nextIndex = 0;

    if (nextIndex !== index) {
      setTimeout(() => {
        const buttons = this.stepButtons();
        if (buttons && buttons[nextIndex]) {
          buttons[nextIndex].nativeElement.focus();
        }
      });
    }
  }
}
