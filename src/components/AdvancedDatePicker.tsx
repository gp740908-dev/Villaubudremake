import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  startOfDay,
  isSameDay,
  isWithinInterval,
  addDays,
  differenceInDays,
} from "date-fns";

interface AdvancedDatePickerProps {
  bookedDates: string[];
  checkIn: Date | null;
  checkOut: Date | null;
  onCheckInChange: (date: Date | null) => void;
  onCheckOutChange: (date: Date | null) => void;
  minimumStay?: number;
  maximumStay?: number;
  isOpen: boolean;
  onClose: () => void;
}

const AdvancedDatePicker = ({
  bookedDates,
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  minimumStay = 1,
  maximumStay = 30,
  isOpen,
  onClose,
}: AdvancedDatePickerProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);

  const months = useMemo(() => {
    return [currentMonth, addMonths(currentMonth, 1), addMonths(currentMonth, 2)];
  }, [currentMonth]);

  const getDaysForMonth = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return eachDayOfInterval({ start, end });
  };

  const getStartDay = (month: Date) => startOfMonth(month).getDay();

  const isDateBooked = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookedDates.includes(dateStr);
  };

  const isCheckoutOnlyDay = (date: Date): boolean => {
    // A day where someone is checking out (previous day was last booked day)
    const prevDay = addDays(date, -1);
    const prevDayStr = format(prevDay, 'yyyy-MM-dd');
    const currentStr = format(date, 'yyyy-MM-dd');
    return bookedDates.includes(prevDayStr) && !bookedDates.includes(currentStr);
  };

  const getDayStatus = (date: Date) => {
    const today = startOfDay(new Date());

    if (isBefore(date, today)) return "past";
    if (isDateBooked(date)) return "booked";
    if (checkIn && isSameDay(date, checkIn)) return "check-in";
    if (checkOut && isSameDay(date, checkOut)) return "check-out";
    if (checkIn && checkOut && isWithinInterval(date, { start: checkIn, end: checkOut })) {
      return "selected";
    }
    if (isCheckoutOnlyDay(date)) return "checkout-only";
    return "available";
  };

  const canSelectDate = (date: Date): boolean => {
    const today = startOfDay(new Date());
    if (isBefore(date, today)) return false;
    
    if (!selectingCheckOut) {
      // Selecting check-in: can't select booked dates
      return !isDateBooked(date);
    } else {
      // Selecting check-out
      if (!checkIn) return false;
      if (isBefore(date, addDays(checkIn, minimumStay))) return false;
      if (differenceInDays(date, checkIn) > maximumStay) return false;
      
      // Check if any date between checkIn and this date is booked
      let current = addDays(checkIn, 1);
      while (isBefore(current, date)) {
        if (isDateBooked(current)) return false;
        current = addDays(current, 1);
      }
      return true;
    }
  };

  const handleDateClick = (date: Date) => {
    if (!canSelectDate(date)) return;

    if (!selectingCheckOut || !checkIn) {
      onCheckInChange(date);
      onCheckOutChange(null);
      setSelectingCheckOut(true);
    } else {
      onCheckOutChange(date);
      setSelectingCheckOut(false);
      onClose();
    }
  };

  const clearDates = () => {
    onCheckInChange(null);
    onCheckOutChange(null);
    setSelectingCheckOut(false);
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-background rounded-2xl shadow-elevated max-w-4xl w-full max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-background z-10 p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-semibold">
                {selectingCheckOut ? "Select Check-out Date" : "Select Check-in Date"}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Selected Dates Summary */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Check-in:</span>
                <span className="font-medium">
                  {checkIn ? format(checkIn, "MMM d, yyyy") : "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Check-out:</span>
                <span className="font-medium">
                  {checkOut ? format(checkOut, "MMM d, yyyy") : "—"}
                </span>
              </div>
              {checkIn && checkOut && (
                <span className="text-sm text-primary font-medium">
                  {differenceInDays(checkOut, checkIn)} nights
                </span>
              )}
              {(checkIn || checkOut) && (
                <button
                  onClick={clearDates}
                  className="text-sm text-destructive hover:underline"
                >
                  Clear dates
                </button>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-secondary border border-primary" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-destructive/30" />
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-yellow-200" />
                <span>Check-out only</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-primary" />
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded border-2 border-primary" />
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              disabled={isBefore(startOfMonth(currentMonth), startOfMonth(new Date()))}
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-8">
              {months.slice(0, 2).map((month, idx) => (
                <span key={idx} className="font-medium hidden md:block">
                  {format(month, "MMMM yyyy")}
                </span>
              ))}
              <span className="font-medium md:hidden">
                {format(currentMonth, "MMMM yyyy")}
              </span>
            </div>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Calendars Grid */}
          <div className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {months.map((month, monthIdx) => (
                <div key={monthIdx} className={monthIdx === 2 ? "hidden lg:block" : ""}>
                  <h4 className="text-center font-medium mb-4 md:hidden">
                    {format(month, "MMMM yyyy")}
                  </h4>

                  {/* Week Days */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-muted-foreground py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: getStartDay(month) }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {getDaysForMonth(month).map((date) => {
                      const status = getDayStatus(date);
                      const selectable = canSelectDate(date);

                      return (
                        <button
                          key={date.toISOString()}
                          onClick={() => handleDateClick(date)}
                          disabled={!selectable}
                          className={`
                            aspect-square flex items-center justify-center text-sm rounded-lg transition-all
                            ${status === "past" ? "text-muted-foreground/40 cursor-not-allowed" : ""}
                            ${status === "booked" ? "bg-destructive/20 text-destructive line-through cursor-not-allowed" : ""}
                            ${status === "checkout-only" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" : ""}
                            ${status === "check-in" ? "bg-primary text-primary-foreground font-medium rounded-l-lg rounded-r-none" : ""}
                            ${status === "check-out" ? "bg-primary text-primary-foreground font-medium rounded-r-lg rounded-l-none" : ""}
                            ${status === "selected" ? "bg-primary/30 text-foreground" : ""}
                            ${status === "available" && selectable ? "bg-secondary hover:bg-primary/20 cursor-pointer" : ""}
                            ${status === "available" && !selectable ? "bg-muted/50 text-muted-foreground cursor-not-allowed" : ""}
                            ${isToday(date) ? "ring-2 ring-primary ring-offset-1" : ""}
                          `}
                        >
                          {format(date, "d")}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-background border-t border-border p-4 flex justify-end gap-3">
            <button onClick={onClose} className="btn-outline px-6 py-2">
              Cancel
            </button>
            <button
              onClick={onClose}
              disabled={!checkIn || !checkOut}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                checkIn && checkOut
                  ? "btn-primary"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Apply Dates
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdvancedDatePicker;
