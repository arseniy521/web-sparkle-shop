import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Loader2, ChevronRight, Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OnboardingFormData } from './useOnboardingForm';

interface Step3TimingProps {
  data: OnboardingFormData;
  setField: <K extends keyof OnboardingFormData>(key: K, value: OnboardingFormData[K]) => void;
  onNext: () => void;
  isLoading: boolean;
  /** When the dialog opens, refreshes the next-7-days window and tracks calendar rollover. */
  dialogOpen: boolean;
}

const TIME_SLOTS = [
  { hour: 8,  label: '08:00' },
  { hour: 9,  label: '09:00' },
  { hour: 10, label: '10:00' },
  { hour: 11, label: '11:00' },
  { hour: 12, label: '12:00' },
  { hour: 13, label: '13:00' },
  { hour: 14, label: '14:00' },
  { hour: 15, label: '15:00' },
  { hour: 16, label: '16:00' },
  { hour: 17, label: '17:00' },
  { hour: 18, label: '18:00' },
  { hour: 19, label: '19:00' },
];

const SLOT_GROUPS = [
  { labelKey: 'onboarding.step3.groups.morning',   hours: [8,9,10,11] },
  { labelKey: 'onboarding.step3.groups.afternoon', hours: [12,13,14,15,16] },
  { labelKey: 'onboarding.step3.groups.evening',   hours: [17,18,19] },
];

function getNext7Days(from: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDayPill(date: Date, locale: string): { short: string; num: number; isToday: boolean } {
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const short = date.toLocaleDateString(locale, { weekday: 'short' });
  return { short: short.charAt(0).toLocaleUpperCase(locale) + short.slice(1), num: date.getDate(), isToday };
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function buildDateTimeLocal(date: Date, hour: number): string {
  return `${dateKey(date)}T${pad2(hour)}:00:00`;
}

function parseSelectedDay(iso: string | null): string | null {
  if (!iso) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso.slice(0, 10);
  return dateKey(new Date(iso));
}

function parseSelectedHour(iso: string | null): number | null {
  if (!iso) return null;
  const match = iso.match(/T(\d{2}):/);
  return match ? Number(match[1]) : null;
}

function dateFromKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getWeekdays(locale: string): string[] {
  const base = new Date(2026, 0, 4);
  const firstDay = (() => {
    try {
      return (new (Intl as typeof Intl & {
        Locale: new (value: string) => { weekInfo?: { firstDay?: number } };
      }).Locale(locale)).weekInfo?.firstDay ?? 1;
    } catch {
      return 1;
    }
  })();
  const startOffset = firstDay === 7 ? 0 : firstDay - 1;
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(base);
    day.setDate(base.getDate() + startOffset + i);
    return day.toLocaleDateString(locale, { weekday: 'short' });
  });
}

function firstDayOffset(date: Date, locale: string): number {
  const day = date.getDay();
  const firstDay = (() => {
    try {
      return (new (Intl as typeof Intl & {
        Locale: new (value: string) => { weekInfo?: { firstDay?: number } };
      }).Locale(locale)).weekInfo?.firstDay ?? 1;
    } catch {
      return 1;
    }
  })();
  const firstDow = firstDay === 7 ? 0 : firstDay;
  return (day - firstDow + 7) % 7;
}

export const Step3Timing = ({ data, setField, onNext, isLoading, dialogOpen }: Step3TimingProps) => {
  const { t, i18n } = useTranslation();
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [calendarDayKey, setCalendarDayKey] = useState(() => dateKey(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => {
      const k = dateKey(new Date());
      setCalendarDayKey((prev) => (prev !== k ? k : prev));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (dialogOpen) {
      setCalendarDayKey(dateKey(new Date()));
    }
  }, [dialogOpen]);

  const next7 = useMemo(() => getNext7Days(dateFromKey(calendarDayKey)), [calendarDayKey]);

  const isAsap = data.desiredTiming === 'ASAP';
  const isSpecific = data.desiredTiming === 'CUSTOM_DATE';

  const selectedDayStr = parseSelectedDay(data.desiredDate);
  const selectedHour = parseSelectedHour(data.desiredDate);

  const selectDay = (date: Date) => {
    setField('desiredTiming', 'CUSTOM_DATE');
    if (selectedHour !== null) {
      setField('desiredDate', buildDateTimeLocal(date, selectedHour));
    } else {
      setField('desiredDate', dateKey(date));
    }
    setShowFullCalendar(false);
  };

  const selectHour = (hour: number) => {
    const base = (() => {
      if (selectedDayStr) {
        const found = next7.find((d) => dateKey(d) === selectedDayStr);
        if (found) return found;
        return dateFromKey(selectedDayStr);
      }
      return new Date();
    })();
    setField('desiredDate', buildDateTimeLocal(base, hour));
  };

  const selectAsap = () => {
    setField('desiredTiming', 'ASAP');
    setField('desiredDate', null);
  };

  const canSubmit =
    !isLoading &&
    (isAsap || (isSpecific && selectedDayStr !== null && selectedHour !== null));

  const calYear = calendarMonth.getFullYear();
  const calMonthIdx = calendarMonth.getMonth();
  const daysInMonth = new Date(calYear, calMonthIdx + 1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);
  const weekdays = getWeekdays(i18n.language);
  const leadingDays = firstDayOffset(new Date(calYear, calMonthIdx, 1), i18n.language);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={selectAsap}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all',
          isAsap
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/40 hover:bg-muted/40',
        )}
      >
        <div className={cn(
          'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0',
          isAsap ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
        )}>
          <Zap className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-foreground">{t('onboarding.step3.slots.asap')}</div>
          <div className="text-xs text-muted-foreground">{t('onboarding.step3.asapHint')}</div>
        </div>
        {isAsap && (
          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Check className="h-3 w-3 text-primary-foreground" />
          </div>
        )}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs text-muted-foreground">
            {t('onboarding.step3.orSpecific')}
          </span>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 snap-x scrollbar-none">
        {next7.map((day) => {
          const { short, num, isToday } = formatDayPill(day, i18n.language);
          const isSelected = selectedDayStr === dateKey(day);
          return (
            <button
              key={day.toDateString()}
              type="button"
              onClick={() => selectDay(day)}
              className={cn(
                'snap-start flex-shrink-0 flex flex-col items-center gap-0.5 w-11 py-1.5 rounded-xl border-2 transition-all',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/40 hover:bg-muted/40 text-foreground',
              )}
            >
              <span className="text-[10px] font-medium opacity-70">
                {isToday ? t('onboarding.step3.today') : short}
              </span>
              <span className="text-sm font-bold">{num}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setShowFullCalendar(!showFullCalendar)}
          className={cn(
            'snap-start flex-shrink-0 flex flex-col items-center justify-center gap-0.5 w-11 py-1.5 rounded-xl border-2 transition-all',
            showFullCalendar
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-dashed border-border hover:border-primary/40 text-muted-foreground',
          )}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="text-[10px]">{t('onboarding.step3.more')}</span>
        </button>
      </div>

      {showFullCalendar && (
        <div className="rounded-xl border border-border p-3 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              className="h-7 w-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground text-lg leading-none"
            >
              ‹
            </button>
            <span className="text-sm font-semibold text-foreground capitalize">
              {calendarMonth.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              className="h-7 w-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground text-lg leading-none"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {weekdays.map((d) => (
              <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-0.5">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: leadingDays }).map((_, i) => (
              <div key={`e${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = new Date(calYear, calMonthIdx, i + 1);
              const isPast = d < today;
              const isSelected = selectedDayStr === dateKey(d);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={isPast}
                  onClick={() => selectDay(d)}
                  className={cn(
                    'aspect-square rounded-lg text-xs font-medium transition-all',
                    isPast && 'opacity-30 cursor-not-allowed',
                    isSelected && 'bg-primary text-primary-foreground',
                    !isSelected && !isPast && 'hover:bg-muted',
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isSpecific && selectedDayStr && (
        <div className="space-y-2 animate-fade-in">
          {SLOT_GROUPS.map((group) => {
            const groupSlots = TIME_SLOTS.filter((s) => group.hours.includes(s.hour));
            return (
              <div key={group.labelKey}>
                <p className="text-xs font-medium text-muted-foreground mb-1">{t(group.labelKey)}</p>
                <div className="flex flex-wrap gap-1.5">
                  {groupSlots.map((slot) => {
                    const isSelected = selectedHour === slot.hour;
                    const nowHour = new Date().getHours();
                    const isToday2 = selectedDayStr === dateKey(new Date());
                    const isPast = isToday2 && slot.hour < nowHour;
                    return (
                      <button
                        key={slot.hour}
                        type="button"
                        disabled={isPast}
                        onClick={() => selectHour(slot.hour)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg border text-xs font-medium transition-all',
                          isPast && 'opacity-30 cursor-not-allowed',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : !isPast && 'border-border hover:border-primary/40 hover:bg-muted/40',
                        )}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Button onClick={onNext} disabled={!canSubmit} size="default" className="w-full group">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {t('onboarding.next')}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </Button>
    </div>
  );
};
