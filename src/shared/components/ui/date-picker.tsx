import { DateTime } from "luxon";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "#/shared/components/ui/button";
import { useFormDisabled } from "#/shared/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "#/shared/components/ui/popover";
import { cn } from "#/shared/utils/cn";

type DatePickerProps = Omit<ComponentProps<"button">, "onChange" | "value"> & {
  disablePast?: boolean;
  min?: string;
  onValueChange: (value: string) => void;
  value: string;
};

const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

function DatePicker({
  className,
  disablePast = false,
  disabled,
  min,
  onValueChange,
  value,
  ...props
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => getInitialVisibleMonth(value));
  const isFormDisabled = useFormDisabled();
  const isDatePickerDisabled = disabled || isFormDisabled;

  const minDate = useMemo(
    () => parseDateInputValue(disablePast ? (min ?? getTodayDateInputValue()) : min),
    [disablePast, min],
  );
  const selectedDate = parseDateInputValue(value);
  const calendarDays = getCalendarDays(visibleMonth);

  useEffect(() => {
    const nextSelectedDate = parseDateInputValue(value);

    if (nextSelectedDate) {
      setVisibleMonth(startOfMonth(nextSelectedDate));
    }
  }, [value]);

  useEffect(() => {
    if (isDatePickerDisabled) {
      setIsOpen(false);
    }
  }, [isDatePickerDisabled]);

  function handleSelectDate(date: Date) {
    onValueChange(formatDateInputValue(date));
    setIsOpen(false);
  }

  function goToPreviousMonth() {
    setVisibleMonth((currentMonth) => {
      const previousMonth = new Date(currentMonth);
      previousMonth.setMonth(previousMonth.getMonth() - 1);

      return previousMonth;
    });
  }

  function goToNextMonth() {
    setVisibleMonth((currentMonth) => {
      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      return nextMonth;
    });
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "border-input bg-surface text-foreground focus-visible:border-ring focus-visible:ring-ring/25 aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-destructive/25 flex h-9 w-full min-w-0 items-center justify-start gap-2 rounded-md border px-3 py-1 text-sm shadow-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
            !value && "text-muted",
            className,
          )}
          disabled={isDatePickerDisabled}
          type="button"
          {...props}
        >
          <CalendarDays className="size-4 shrink-0" />
          <span>{selectedDate ? formatDisplayDate(selectedDate) : "Pick Date"}</span>
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-72 p-3">
        <div className="flex items-center justify-between">
          <Button
            aria-label="Previous month"
            onClick={goToPreviousMonth}
            size="icon"
            type="button"
            variant="ghost"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <p className="text-sm font-medium">{formatMonthLabel(visibleMonth)}</p>

          <Button
            aria-label="Next month"
            onClick={goToNextMonth}
            size="icon"
            type="button"
            variant="ghost"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1">
          {weekDays.map((weekDay) => (
            <div
              className="text-muted flex size-8 items-center justify-center text-xs font-medium"
              key={weekDay}
            >
              {weekDay}
            </div>
          ))}

          {calendarDays.map((date) => {
            const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
            const isSelected = selectedDate ? isSameDate(date, selectedDate) : false;
            const isDateDisabled = minDate ? isBeforeDate(date, minDate) : false;

            return (
              <button
                aria-label={formatDisplayDate(date)}
                aria-pressed={isSelected}
                className={cn(
                  "hover:bg-surface-muted focus-visible:ring-ring flex size-8 items-center justify-center rounded-md text-sm transition-colors outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-40",
                  !isCurrentMonth && "text-muted",
                  isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
                disabled={isDatePickerDisabled || isDateDisabled}
                key={formatDateInputValue(date)}
                onClick={() => handleSelectDate(date)}
                type="button"
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function getInitialVisibleMonth(value: string) {
  return startOfMonth(parseDateInputValue(value) ?? new Date());
}

function getCalendarDays(visibleMonth: Date) {
  const firstDayOfMonth = startOfMonth(visibleMonth);
  const firstCalendarDay = new Date(firstDayOfMonth);
  firstCalendarDay.setDate(firstCalendarDay.getDate() - firstDayOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstCalendarDay);
    date.setDate(firstCalendarDay.getDate() + index);

    return date;
  });
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function parseDateInputValue(value?: string) {
  if (!value) {
    return null;
  }

  const parsedDate = DateTime.fromISO(value);

  if (!parsedDate.isValid) {
    return null;
  }

  return new Date(parsedDate.year, parsedDate.month - 1, parsedDate.day);
}

function formatDateInputValue(date: Date) {
  return DateTime.fromJSDate(date).toISODate() ?? "";
}

function formatDisplayDate(date: Date) {
  return DateTime.fromJSDate(date).toFormat("dd LLL yyyy");
}

function formatMonthLabel(date: Date) {
  return DateTime.fromJSDate(date).toFormat("LLLL yyyy");
}

function isBeforeDate(date: Date, minimumDate: Date) {
  return date.getTime() < minimumDate.getTime();
}

function isSameDate(firstDate: Date, secondDate: Date) {
  return firstDate.getTime() === secondDate.getTime();
}

function getTodayDateInputValue() {
  return DateTime.now().toISODate() ?? "";
}

export { DatePicker };
