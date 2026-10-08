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

export interface DatePickerProps {
  format?: string;
  minDate?: string;
  maxDate?: string;
  showTime?: boolean;
  timezone?: string;
  value?: string; // ISO 8601 UTC
  'aria-label'?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  disabled: boolean;
}

@Component({
  selector: 'origo-date-picker',
  standalone: true,
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class DatePickerComponent implements OrigoAdapter<DatePickerProps> {
  static readonly contractSchema = {
    format: 'string',
    minDate: 'string',
    maxDate: 'string',
    showTime: 'boolean',
    timezone: 'string',
    value: 'string',
    'aria-label': 'string',
    permissions: 'array',
    rules: 'array',
    metadata: 'object',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<DatePickerProps>>();
  value = model<string | null>(null);

  isOpen = signal<boolean>(false);
  currentViewDate = signal<Date>(
    new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1))
  );

  private experienceAdapter = inject(WebExperienceAdapterService);
  private elementRef = inject(ElementRef);

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  computedAriaLabel = computed(() => this.contract().props?.['aria-label'] || 'Date Picker');

  displayValue = computed(() => {
    const val = this.value();
    if (!val) return '';
    const d = this.parseSafeUTC(val);
    if (!d) return '';
    // Format as YYYY-MM-DD using UTC methods
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  });

  private parseSafeUTC(isoString: string): Date | null {
    if (!isoString) return null;
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    return d;
  }

  constructor() {
    effect(() => {
      const contractVal = this.contract().props?.value;
      untracked(() => {
        if (contractVal === undefined || contractVal === null) {
          this.value.set(null);
        } else {
          this.value.set(String(contractVal));
          const d = this.parseSafeUTC(String(contractVal));
          if (d) {
            this.currentViewDate.set(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)));
          }
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

  toggleCalendar() {
    this.isOpen.update(v => !v);
  }

  currentMonthYear = computed(() => {
    const d = this.currentViewDate();
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return `${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  });

  private isDateDisabled(date: Date): boolean {
    const minDateStr = this.contract().props?.minDate;
    const maxDateStr = this.contract().props?.maxDate;

    if (minDateStr) {
      const minD = this.parseSafeUTC(minDateStr);
      if (minD && date < minD) return true;
    }
    if (maxDateStr) {
      const maxD = this.parseSafeUTC(maxDateStr);
      if (maxD && date > maxD) return true;
    }
    return false;
  }

  calendarGrid = computed(() => {
    const viewDate = this.currentViewDate();
    const year = viewDate.getUTCFullYear();
    const month = viewDate.getUTCMonth();

    const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
    const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0));

    const startingDayOfWeek = firstDayOfMonth.getUTCDay();

    const startDate = new Date(firstDayOfMonth);
    startDate.setUTCDate(startDate.getUTCDate() - startingDayOfWeek);

    const weeks: CalendarDay[][] = [];
    const currentDay = new Date(startDate);

    const today = new Date();

    while (weeks.length < 6) {
      if (currentDay.getUTCDay() === 0) {
        weeks.push([]);
      }

      const isCurrentMonth = currentDay.getUTCMonth() === month;

      weeks[weeks.length - 1].push({
        date: new Date(currentDay),
        isCurrentMonth,
        isToday:
          currentDay.getUTCFullYear() === today.getUTCFullYear() &&
          currentDay.getUTCMonth() === today.getUTCMonth() &&
          currentDay.getUTCDate() === today.getUTCDate(),
        disabled: this.isDateDisabled(currentDay),
      });

      currentDay.setUTCDate(currentDay.getUTCDate() + 1);
    }

    return weeks;
  });

  hasSelection(): boolean {
    return !!this.value();
  }

  isSelected(date: Date): boolean {
    const val = this.value();
    if (!val) return false;
    const selected = this.parseSafeUTC(val);
    if (!selected) return false;
    return (
      selected.getUTCFullYear() === date.getUTCFullYear() &&
      selected.getUTCMonth() === date.getUTCMonth() &&
      selected.getUTCDate() === date.getUTCDate()
    );
  }

  selectDate(year: number, month: number, day: number) {
    const selectedDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    if (this.isDateDisabled(selectedDate)) return;

    const isoString = selectedDate.toISOString();
    this.value.set(isoString);
    this.experienceAdapter.updateState(this.contract().id, 'value', isoString);
    this.isOpen.set(false);
  }

  prevMonth() {
    const d = this.currentViewDate();
    this.currentViewDate.set(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1)));
  }

  nextMonth() {
    const d = this.currentViewDate();
    this.currentViewDate.set(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)));
  }

  onInputKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.isOpen.set(true);
    }
  }

  onDayKeyDown(event: KeyboardEvent, date: Date) {
    const d = new Date(date);
    let handled = false;

    switch (event.key) {
      case 'Enter':
      case ' ':
        this.selectDate(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
        handled = true;
        break;
      case 'ArrowRight':
        d.setUTCDate(d.getUTCDate() + 1);
        handled = true;
        break;
      case 'ArrowLeft':
        d.setUTCDate(d.getUTCDate() - 1);
        handled = true;
        break;
      case 'ArrowDown':
        d.setUTCDate(d.getUTCDate() + 7);
        handled = true;
        break;
      case 'ArrowUp':
        d.setUTCDate(d.getUTCDate() - 7);
        handled = true;
        break;
      case 'PageUp':
        d.setUTCMonth(d.getUTCMonth() - 1);
        handled = true;
        break;
      case 'PageDown':
        d.setUTCMonth(d.getUTCMonth() + 1);
        handled = true;
        break;
    }

    if (handled) {
      event.preventDefault();
      if (
        d.getUTCMonth() !== this.currentViewDate().getUTCMonth() ||
        d.getUTCFullYear() !== this.currentViewDate().getUTCFullYear()
      ) {
        this.currentViewDate.set(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)));
      }
      // Focus management for a11y: find the element with matching date in the DOM and focus it
      setTimeout(() => {
        const id = `day-${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
        const el = this.elementRef.nativeElement.shadowRoot?.getElementById(id);
        if (el) el.focus();
      }, 0);
    }
  }
}
