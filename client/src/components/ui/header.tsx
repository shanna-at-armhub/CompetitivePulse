import { useState } from "react";
import { ChevronLeft, ChevronRight, Menu, Bell, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { useCalendar } from "@/hooks/use-calendar";

type HeaderProps = {
  onMenuButtonClick: () => void;
};

export function Header({ onMenuButtonClick }: HeaderProps) {
  const { currentDate, setCurrentDate, view, setView } = useCalendar();
  
  // Navigation
  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  return (
    <header className="relative z-10 flex items-center justify-between h-16 bg-white border-b border-gray-200 px-4 sm:px-6">
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuButtonClick}>
        <Menu className="h-6 w-6 text-gray-500" />
      </Button>
      
      {/* Calendar title */}
      <h2 className="text-lg font-semibold text-gray-800 hidden md:block">Team Calendar</h2>
      
      {/* Calendar controls */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </Button>
          <span className="text-sm font-medium">{format(currentDate, "MMMM yyyy")}</span>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
        
        <div className="hidden md:flex border rounded-md overflow-hidden divide-x divide-gray-200">
          <Button
            variant="ghost"
            className={cn(
              "px-3 py-1 text-sm font-medium rounded-none",
              view === "month" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            )}
            onClick={() => setView("month")}
          >
            Month
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "px-3 py-1 text-sm font-medium rounded-none",
              view === "week" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            )}
            onClick={() => setView("week")}
          >
            Week
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "px-3 py-1 text-sm font-medium rounded-none",
              view === "day" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            )}
            onClick={() => setView("day")}
          >
            Day
          </Button>
        </div>
      </div>
      
      {/* User controls */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" className="text-sm text-gray-700" onClick={handleToday}>
          <span className="hidden md:inline-block mr-2">Today</span>
          <Calendar className="h-5 w-5 text-gray-500" />
        </Button>
        
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5 text-gray-500" />
        </Button>
      </div>
    </header>
  );
}
