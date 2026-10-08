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

export interface DateRangePickerProps {
  format?: string;
  minDate?: string;
  maxDate?: string;
  showTime?: boolean;
  timezone?: string;
  startDate?: string; // ISO 8601 UTC
  endDate?: string; // ISO 8601 UTC
  'aria-label'?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  disabled: boolean;
}

@Component({
  selector: 'origo-date-range-picker',
  standalone: true,
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class DateRangePickerComponent implements OrigoAdapter<DateRangePickerProps> {
  static readonly contractSchema = {
    format: 'string',
    minDate: 'string',
    maxDate: 'string',
    showTime: 'boolean',
    timezone: 'string',
    startDate: 'string',
    endDate: 'string',
    'aria-label': 'string',
    permissions: 'array',
    rules: 'array',
    metadata: 'object',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<DateRangePickerProps>>();

  // DateRangePicker doesn't use a single value model in the same way, but keeping it for adapter compat if needed
  value = model<any>(null);

  startDate = signal<string | null>(null);
  endDate = signal<string | null>(null);

  isOpen = signal<boolean>(false);
  currentViewDate = signal<Date>(
    new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1))
  );
  selectionPhase = signal<'start' | 'end'>('start');

  private experienceAdapter = inject(WebExperienceAdapterService);
  private elementRef = inject(ElementRef);

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  computedAriaLabel = computed(() => this.contract().props?.['aria-label'] || 'Date Range Picker');

  displayStartValue = computed(() => this.formatDateStr(this.startDate()));
  displayEndValue = computed(() => this.formatDateStr(this.endDate()));

  private parseSafeUTC(isoString: string | null | undefined): Date | null {
    if (!isoString || isoString === 'null' || isoString === 'undefined') return null;
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    return d;
  }

  private formatDateStr(val: string | null): string {
    const d = this.parseSafeUTC(val);
    if (!d) return '';
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  }

  constructor() {
    effect(() => {
      const s = this.contract().props?.startDate;
      const e = this.contract().props?.endDate;
      untracked(() => {
        this.startDate.set(s === undefined || s === null ? null : String(s));
        this.endDate.set(e === undefined || e === null ? null : String(e));

        const dateToView = this.parseSafeUTC(this.startDate()) || new Date();
        this.currentViewDate.set(
          new Date(Date.UTC(dateToView.getUTCFullYear(), dateToView.getUTCMonth(), 1))
        );
      });
    });
  }

  @HostListener('document:mousedown', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.cancelSelection();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen()) {
      this.cancelSelection();
    }
  }

  private cancelSelection() {
    // If we're mid-selection, revert to the contract state
    if (this.selectionPhase() === 'end') {
      const s = this.contract().props?.startDate;
      this.startDate.set(s === undefined || s === null ? null : String(s));
      this.selectionPhase.set('start');
    }
    this.isOpen.set(false);
  }

  toggleCalendar() {
    if (this.isOpen()) {
      this.cancelSelection();
    } else {
      this.isOpen.set(true);
    }
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

    const startingDayOfWeek = firstDayOfMonth.getUTCDay();

    const startDateGrid = new Date(firstDayOfMonth);
    startDateGrid.setUTCDate(startDateGrid.getUTCDate() - startingDayOfWeek);

    const weeks: CalendarDay[][] = [];
    const currentDay = new Date(startDateGrid);

    const today = new Date();

    while (weeks.length < 6) {
      if (currentDay.getUTCDay() === 0) {
        weeks.push([]);
      }

      weeks[weeks.length - 1].push({
        date: new Date(currentDay),
        isCurrentMonth: currentDay.getUTCMonth() === month,
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

  isSameDate(d1Str: string | null, d2: Date): boolean {
    const d1 = this.parseSafeUTC(d1Str);
    if (!d1) return false;
    return (
      d1.getUTCFullYear() === d2.getUTCFullYear() &&
      d1.getUTCMonth() === d2.getUTCMonth() &&
      d1.getUTCDate() === d2.getUTCDate()
    );
  }

  isSelected(date: Date): boolean {
    return this.isSameDate(this.startDate(), date) || this.isSameDate(this.endDate(), date);
  }

  isInRange(date: Date): boolean {
    const sDate = this.parseSafeUTC(this.startDate());
    const eDate = this.parseSafeUTC(this.endDate());
    if (!sDate || !eDate) return false;

    // Normalize to start of UTC day for comparison
    const normDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    const normS = Date.UTC(sDate.getUTCFullYear(), sDate.getUTCMonth(), sDate.getUTCDate());
    const normE = Date.UTC(eDate.getUTCFullYear(), eDate.getUTCMonth(), eDate.getUTCDate());

    return normDate >= Math.min(normS, normE) && normDate <= Math.max(normS, normE);
  }

  onDayClick(date: Date) {
    if (this.isDateDisabled(date)) return;

    if (this.selectionPhase() === 'start') {
      const iso = date.toISOString();
      this.startDate.set(iso);
      this.endDate.set(null);
      this.selectionPhase.set('end');
    } else {
      let startD = this.parseSafeUTC(this.startDate());
      if (!startD) {
        startD = date;
      }
      let endD = date;

      if (endD.getTime() < startD.getTime()) {
        const temp = startD;
        startD = endD;
        endD = temp;
      }

      this.selectRange(startD, endD);
      this.selectionPhase.set('start');
      this.isOpen.set(false);
    }
  }

  selectRange(start: Date, end: Date) {
    const s = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())
    ).toISOString();
    const e = new Date(
      Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate())
    ).toISOString();

    let actualStart = s;
    let actualEnd = e;

    if (new Date(e).getTime() < new Date(s).getTime()) {
      actualStart = e;
      actualEnd = s;
    }

    this.startDate.set(actualStart);
    this.endDate.set(actualEnd);

    this.experienceAdapter.updateState(this.contract().id, 'startDate', actualStart);
    this.experienceAdapter.updateState(this.contract().id, 'endDate', actualEnd);

    // Also notify if 'value' model binding is used to pass range object
    this.value.set({ startDate: actualStart, endDate: actualEnd });
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
        this.onDayClick(d);
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
    }

    if (handled) {
      event.preventDefault();
      if (
        d.getUTCMonth() !== this.currentViewDate().getUTCMonth() ||
        d.getUTCFullYear() !== this.currentViewDate().getUTCFullYear()
      ) {
        this.currentViewDate.set(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)));
      }
      setTimeout(() => {
        const id = `day-${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
        const el = this.elementRef.nativeElement.shadowRoot?.getElementById(id);
        if (el) el.focus();
      }, 0);
    }
  }
}
