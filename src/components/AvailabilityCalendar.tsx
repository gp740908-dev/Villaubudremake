import { useMemo } from "react";
import { motion } from "framer-motion";
import { isDateBooked } from "@/utils/booking";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  isBefore,
  startOfDay
} from "date-fns";

interface AvailabilityCalendarProps {
  bookedDates: string[];
  checkIn?: Date | null;
  checkOut?: Date | null;
}

const AvailabilityCalendar = ({ bookedDates, checkIn, checkOut }: AvailabilityCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const startDay = startOfMonth(currentMonth).getDay();

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getDayStatus = (date: Date) => {
    const today = startOfDay(new Date());
    
    if (isBefore(date, today)) return "past";
    if (isDateBooked(date, bookedDates)) return "booked";
    if (checkIn && isSameDay(date, checkIn)) return "check-in";
    if (checkOut && isSameDay(date, checkOut)) return "check-out";
    if (checkIn && checkOut && date > checkIn && date < checkOut) return "selected";
    return "available";
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background rounded-2xl border border-border p-6"
    >
      <h3 className="font-display text-lg font-semibold mb-4">Availability</h3>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary/20 border border-primary" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive/20 border border-destructive" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary" />
          <span>Selected</span>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>
        <h4 className="font-medium">{format(currentMonth, "MMMM yyyy")}</h4>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

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

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the first of the month */}
        {Array.from({ length: startDay }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* Days */}
        {days.map((date) => {
          const status = getDayStatus(date);
          
          return (
            <div
              key={date.toISOString()}
              className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-colors ${
                status === "past"
                  ? "text-muted-foreground/50"
                  : status === "booked"
                  ? "bg-destructive/20 text-destructive line-through"
                  : status === "check-in" || status === "check-out"
                  ? "bg-primary text-primary-foreground font-medium"
                  : status === "selected"
                  ? "bg-primary/30 text-foreground"
                  : "bg-primary/10 hover:bg-primary/20 text-foreground cursor-pointer"
              } ${isToday(date) ? "ring-2 ring-primary ring-offset-1" : ""}`}
            >
              {format(date, "d")}
            </div>
          );
        })}
      </div>

      {/* Next Month Preview */}
      <div className="mt-6 pt-6 border-t border-border">
        <button
          onClick={nextMonth}
          className="w-full py-2 text-sm text-primary hover:text-primary/80 font-medium"
        >
          View {format(addMonths(currentMonth, 1), "MMMM yyyy")} →
        </button>
      </div>
    </motion.div>
  );
};

export default AvailabilityCalendar;
