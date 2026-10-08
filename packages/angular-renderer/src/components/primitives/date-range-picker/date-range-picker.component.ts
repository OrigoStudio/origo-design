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
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
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
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<DateRangePickerProps>>();
  value = model<any>(''); // Unused directly for binding, but required by adapter base if needed. We use startDate/endDate via experienceAdapter.

  startDate = signal<string | null>(null);
  endDate = signal<string | null>(null);

  isOpen = signal<boolean>(false);
  currentViewDate = signal<Date>(
    new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1))
  );
  selectionPhase = signal<'start' | 'end'>('start');

  private experienceAdapter = inject(WebExperienceAdapterService);

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  displayStartValue = computed(() => this.formatDateStr(this.startDate()));
  displayEndValue = computed(() => this.formatDateStr(this.endDate()));

  private formatDateStr(val: string | null): string {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return '';
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    } catch {
      return '';
    }
  }

  constructor() {
    effect(() => {
      const s = this.contract().props?.startDate;
      const e = this.contract().props?.endDate;
      untracked(() => {
        if (s) this.startDate.set(String(s));
        if (e) this.endDate.set(String(e));

        const dateToView = s ? new Date(String(s)) : new Date();
        if (!isNaN(dateToView.getTime())) {
          this.currentViewDate.set(
            new Date(Date.UTC(dateToView.getUTCFullYear(), dateToView.getUTCMonth(), 1))
          );
        }
      });
    });
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

  calendarGrid = computed(() => {
    const viewDate = this.currentViewDate();
    const year = viewDate.getUTCFullYear();
    const month = viewDate.getUTCMonth();

    const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
    const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0));

    const startingDayOfWeek = firstDayOfMonth.getUTCDay();

    const startDateGrid = new Date(firstDayOfMonth);
    startDateGrid.setUTCDate(startDateGrid.getUTCDate() - startingDayOfWeek);

    const weeks: CalendarDay[][] = [];
    const currentDay = new Date(startDateGrid);

    const today = new Date();

    while (currentDay <= lastDayOfMonth || weeks.length < 6) {
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
      });

      currentDay.setUTCDate(currentDay.getUTCDate() + 1);
    }

    return weeks;
  });

  isSameDate(d1Str: string | null, d2: Date): boolean {
    if (!d1Str) return false;
    const d1 = new Date(d1Str);
    if (isNaN(d1.getTime())) return false;
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
    const s = this.startDate();
    const e = this.endDate();
    if (!s || !e) return false;
    const sDate = new Date(s);
    const eDate = new Date(e);
    if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) return false;

    // Normalize to start of UTC day for comparison
    const normDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    const normS = Date.UTC(sDate.getUTCFullYear(), sDate.getUTCMonth(), sDate.getUTCDate());
    const normE = Date.UTC(eDate.getUTCFullYear(), eDate.getUTCMonth(), eDate.getUTCDate());

    return normDate >= Math.min(normS, normE) && normDate <= Math.max(normS, normE);
  }

  onDayClick(date: Date) {
    if (this.selectionPhase() === 'start') {
      const iso = date.toISOString();
      this.startDate.set(iso);
      this.endDate.set(null);
      this.experienceAdapter.updateState(this.contract().id, 'startDate', iso);
      this.experienceAdapter.updateState(this.contract().id, 'endDate', null);
      this.selectionPhase.set('end');
    } else {
      let startD = new Date(this.startDate()!);
      let endD = date;

      // Auto-swap if end is before start
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
    // Force UTC boundaries
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
  }

  prevMonth() {
    const d = this.currentViewDate();
    this.currentViewDate.set(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1)));
  }

  nextMonth() {
    const d = this.currentViewDate();
    this.currentViewDate.set(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)));
  }
}
