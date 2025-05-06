import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useCalendar } from "@/hooks/use-calendar";
import { format, addMonths, subMonths } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { WorkPattern } from "@shared/schema";
import { locationEnum } from "@shared/schema";

// Extended work pattern with user details
type WorkPatternWithUser = WorkPattern & {
  user: {
    displayName: string;
    avatarUrl: string | null;
  } | null;
};

export function TeamCalendar() {
  const { currentDate, calendarDays, setCurrentDate } = useCalendar();
  const [locationFilter, setLocationFilter] = useState<string>("all_locations");
  
  // Format date range for API query
  const startDate = calendarDays[0]?.date || new Date();
  const endDate = calendarDays[calendarDays.length - 1]?.date || new Date();
  
  // Fetch team work patterns
  const { data: teamPatterns = [], isLoading } = useQuery<WorkPatternWithUser[]>({
    queryKey: [
      "/api/team/work-patterns", 
      { 
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : "", 
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : "",
        location: locationFilter !== "all_locations" ? locationFilter : undefined
      }
    ],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!startDate && !!endDate,
  });

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Navigate to current month
  const currentMonth = () => {
    setCurrentDate(new Date());
  };

  // Get location name for display
  const getLocationName = (location: string) => {
    switch (location) {
      case "home": return "Home";
      case "office": return "Office";
      case "annual_leave": return "Annual Leave";
      case "personal_leave": return "Personal Leave";
      case "public_holiday": return "Public Holiday";
      case "other": return "Other";
      default: return location;
    }
  };

  // Get color class based on location
  const getLocationClass = (location: string) => {
    switch (location) {
      case "home": return "bg-blue-100 text-blue-800";
      case "office": return "bg-green-100 text-green-800";
      case "annual_leave": return "bg-amber-100 text-amber-800";
      case "personal_leave": return "bg-red-100 text-red-800";
      case "public_holiday": return "bg-purple-100 text-purple-800";
      case "other": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Filter team patterns by day
  const getPatternsByDay = (day: Date | null) => {
    if (!day) return [];
    return teamPatterns.filter(pattern => {
      const patternDate = new Date(pattern.date);
      return (
        patternDate.getDate() === day.getDate() &&
        patternDate.getMonth() === day.getMonth() &&
        patternDate.getFullYear() === day.getFullYear()
      );
    });
  };

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={prevMonth} size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <Button variant="outline" onClick={nextMonth} size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={currentMonth} size="sm">
            Today
          </Button>
        </div>
        
        <div className="w-full sm:w-48">
          <Select
            value={locationFilter}
            onValueChange={(value: string) => setLocationFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_locations">All Locations</SelectItem>
              {Object.values(locationEnum.enumValues).map((location) => (
                <SelectItem key={location} value={location}>
                  {getLocationName(location)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {/* Days of the week */}
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="text-center font-semibold py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar cells */}
          {calendarDays.map((day, index) => (
            <Card 
              key={index} 
              className={`min-h-[120px] ${!day.isCurrentMonth ? "opacity-40" : ""} ${day.isToday ? "ring-2 ring-primary" : ""}`}
            >
              <CardContent className="p-2">
                <div className="text-right text-sm font-medium mb-1">
                  {day.date?.getDate()}
                </div>
                <div className="space-y-1 max-h-[80px] overflow-y-auto">
                  {getPatternsByDay(day.date).map((pattern, patternIndex) => (
                    <div 
                      key={patternIndex}
                      className={`text-xs rounded px-1 py-0.5 flex items-center ${getLocationClass(pattern.location)}`}
                    >
                      <span className="truncate">{pattern.user?.displayName}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}