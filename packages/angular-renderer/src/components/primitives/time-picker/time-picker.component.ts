import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  model,
  signal,
  computed,
  inject,
  effect,
  untracked,
  HostListener,
  ElementRef,
} from '@angular/core';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter } from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface TimePickerProps {
  format?: '12h' | '24h';
  value?: string; // ISO 8601 UTC
  'aria-label'?: string;
}

@Component({
  selector: 'origo-time-picker',
  standalone: true,
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class TimePickerComponent implements OrigoAdapter<TimePickerProps> {
  static readonly contractSchema = {
    format: 'string',
    value: 'string',
    'aria-label': 'string',
    permissions: 'array',
    rules: 'array',
    metadata: 'object',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<TimePickerProps>>();
  value = model<string | null>(null);

  isOpen = signal<boolean>(false);
  selectedHour = signal<number>(0);
  selectedMinute = signal<number>(0);
  selectedPeriod = signal<'AM' | 'PM'>('AM');

  private experienceAdapter = inject(WebExperienceAdapterService);
  private elementRef = inject(ElementRef);

  is12h = computed(() => this.contract().props?.format === '12h');
  computedAriaLabel = computed(() => this.contract().props?.['aria-label'] || 'Time Picker');

  hours = computed(() => {
    return this.is12h()
      ? Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i))
      : Array.from({ length: 24 }, (_, i) => i);
  });

  minutes = computed(() => Array.from({ length: 60 }, (_, i) => i));
  periods = computed(() => ['AM', 'PM'] as const);

  displayValue = computed(() => {
    const val = this.value();
    if (!val) return '';
    const d = this.parseSafeUTC(val);
    if (!d) return '';

    let h = d.getUTCHours();
    const m = d.getUTCMinutes();

    if (this.is12h()) {
      const period = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      if (h === 0) h = 12;
      return `${this.pad(h)}:${this.pad(m)} ${period}`;
    }
    return `${this.pad(h)}:${this.pad(m)}`;
  });

  private parseSafeUTC(timeStr: string): Date | null {
    if (!timeStr) return null;

    // Check for HH:MM format
    const timeMatch = timeStr.trim().match(/^(\d{2}):(\d{2})/);
    if (timeMatch && timeStr.trim().length <= 8) {
      const d = new Date(
        Date.UTC(1970, 0, 1, parseInt(timeMatch[1], 10), parseInt(timeMatch[2], 10), 0, 0)
      );
      return d;
    }

    const d = new Date(timeStr);
    if (isNaN(d.getTime())) return null;
    return d;
  }

  constructor() {
    effect(() => {
      const val = this.contract().props?.value;
      untracked(() => {
        if (val === undefined || val === null) {
          this.value.set(null);
          this.syncInternalStateFromValue(null);
        } else {
          this.value.set(String(val));
          this.syncInternalStateFromValue(String(val));
        }
      });
    });
  }

  @HostListener('document:mousedown', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen()) {
      this.isOpen.set(false);
    }
  }

  private syncInternalStateFromValue(val: string | null) {
    if (!val) {
      this.selectedHour.set(this.is12h() ? 12 : 0);
      this.selectedMinute.set(0);
      this.selectedPeriod.set('AM');
      return;
    }

    const d = this.parseSafeUTC(val);
    if (d) {
      let h = d.getUTCHours();
      this.selectedMinute.set(d.getUTCMinutes());
      if (this.is12h()) {
        this.selectedPeriod.set(h >= 12 ? 'PM' : 'AM');
        h = h % 12;
        if (h === 0) h = 12;
      }
      this.selectedHour.set(h);
    } else {
      this.selectedHour.set(this.is12h() ? 12 : 0);
      this.selectedMinute.set(0);
      this.selectedPeriod.set('AM');
    }
  }

  toggleOverlay() {
    this.isOpen.update(v => !v);
  }

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  isSelectedHour(h: number) {
    return this.selectedHour() === h;
  }
  isSelectedMinute(m: number) {
    return this.selectedMinute() === m;
  }
  isSelectedPeriod(p: string) {
    return this.selectedPeriod() === p;
  }

  selectHour(h: number) {
    this.selectedHour.set(h);
  }
  selectMinute(m: number) {
    this.selectedMinute.set(m);
  }
  selectPeriod(p: 'AM' | 'PM') {
    this.selectedPeriod.set(p);
  }

  selectTime(h: number, m: number, p?: 'AM' | 'PM') {
    this.selectedHour.set(h);
    this.selectedMinute.set(m);
    if (p) this.selectedPeriod.set(p);
    this.confirmTime();
  }

  confirmTime() {
    let h = this.selectedHour();
    const m = this.selectedMinute();

    if (this.is12h()) {
      const p = this.selectedPeriod();
      if (p === 'PM' && h !== 12) h += 12;
      else if (p === 'AM' && h === 12) h = 0;
    }

    let year = 1970;
    let month = 0;
    let day = 1;

    const currentVal = this.value();
    if (currentVal) {
      const parsed = this.parseSafeUTC(currentVal);
      if (parsed) {
        year = parsed.getUTCFullYear();
        month = parsed.getUTCMonth();
        day = parsed.getUTCDate();
      }
    }

    const selectedDate = new Date(Date.UTC(year, month, day, h, m, 0, 0));
    const isoString = selectedDate.toISOString();

    this.value.set(isoString);
    this.experienceAdapter.updateState(this.contract().id, 'value', isoString);
    this.isOpen.set(false);
  }

  onInputKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.isOpen.set(true);
    }
  }
}
