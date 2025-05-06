import { createContext, ReactNode, useContext, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { WorkPattern, RecurringPattern, InsertWorkPattern, InsertRecurringPattern } from "@shared/schema";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  addMonths, 
  getDay, 
  getDaysInMonth,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay
} from "date-fns";
import { useToast } from "@/hooks/use-toast";

type CalendarViewType = "month" | "week" | "day";
type CalendarModeType = "personal" | "team";

type CalendarContextType = {
  // State
  currentDate: Date;
  view: CalendarViewType;
  mode: CalendarModeType;
  locationFilter: string | null;
  
  // Work Patterns
  workPatterns: WorkPattern[];
  recurringPatterns: RecurringPattern[];
  isLoading: boolean;
  teamWorkPatterns: WorkPattern[];
  isTeamLoading: boolean;
  
  // Calendar data
  calendarDays: CalendarDay[];
  
  // Actions
  setCurrentDate: (date: Date) => void;
  setView: (view: CalendarViewType) => void;
  setMode: (mode: CalendarModeType) => void;
  setLocationFilter: (location: string | null) => void;
  
  // Work pattern mutations
  addWorkPattern: (pattern: Omit<InsertWorkPattern, "userId">) => Promise<void>;
  updateWorkPattern: (id: number, pattern: Partial<Omit<InsertWorkPattern, "userId">>) => Promise<void>;
  deleteWorkPattern: (id: number) => Promise<void>;
  
  // Recurring pattern mutations
  addRecurringPattern: (pattern: Omit<InsertRecurringPattern, "userId">) => Promise<void>;
  updateRecurringPattern: (id: number, pattern: Partial<Omit<InsertRecurringPattern, "userId">>) => Promise<void>;
  deleteRecurringPattern: (id: number) => Promise<void>;
};

export type CalendarDay = {
  date: Date | null;
  isCurrentMonth: boolean;
  isToday: boolean;
  workPatterns: WorkPattern[];
};

export const CalendarContext = createContext<CalendarContextType | null>(null);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarViewType>("month");
  const [mode, setMode] = useState<CalendarModeType>("personal");
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  
  // Calculate date range for queries based on view
  let startDate: Date;
  let endDate: Date;
  
  if (view === "month") {
    startDate = startOfMonth(currentDate);
    endDate = endOfMonth(currentDate);
  } else if (view === "week") {
    startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday as week start
    endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
  } else { // day view
    startDate = startOfDay(currentDate);
    endDate = endOfDay(currentDate);
  }
  
  // Fetch personal work patterns
  const {
    data: workPatterns = [],
    isLoading: isWorkPatternsLoading
  } = useQuery<WorkPattern[]>({
    queryKey: ["/api/work-patterns", { startDate: format(startDate, "yyyy-MM-dd"), endDate: format(endDate, "yyyy-MM-dd") }],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });
  
  // Fetch recurring patterns
  const {
    data: recurringPatterns = [],
    isLoading: isRecurringPatternsLoading
  } = useQuery<RecurringPattern[]>({
    queryKey: ["/api/recurring-patterns"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });
  
  // Fetch team work patterns
  const {
    data: teamWorkPatterns = [],
    isLoading: isTeamPatternsLoading
  } = useQuery<WorkPattern[]>({
    queryKey: [
      "/api/team/work-patterns", 
      { 
        startDate: format(startDate, "yyyy-MM-dd"), 
        endDate: format(endDate, "yyyy-MM-dd"),
        location: locationFilter 
      }
    ],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user && mode === "team",
  });
  
  // Mutations for work patterns
  const addWorkPatternMutation = useMutation({
    mutationFn: async (pattern: Omit<InsertWorkPattern, "userId">) => {
      console.log("Sending pattern data:", pattern);
      const res = await apiRequest("POST", "/api/work-patterns", pattern);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server response error:", errorText);
        throw new Error(`Failed to add work pattern: ${errorText}`);
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-patterns"] });
      toast({
        title: "Success",
        description: "Work pattern added successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Error details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add work pattern",
        variant: "destructive",
      });
    },
  });
  
  const updateWorkPatternMutation = useMutation({
    mutationFn: async ({ id, pattern }: { id: number, pattern: Partial<Omit<InsertWorkPattern, "userId">> }) => {
      await apiRequest("PUT", `/api/work-patterns/${id}`, pattern);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-patterns"] });
      toast({
        title: "Success",
        description: "Work pattern updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update work pattern",
        variant: "destructive",
      });
    },
  });
  
  const deleteWorkPatternMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/work-patterns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-patterns"] });
      toast({
        title: "Success",
        description: "Work pattern deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete work pattern",
        variant: "destructive",
      });
    },
  });
  
  // Mutations for recurring patterns
  const addRecurringPatternMutation = useMutation({
    mutationFn: async (pattern: Omit<InsertRecurringPattern, "userId">) => {
      await apiRequest("POST", "/api/recurring-patterns", pattern);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-patterns"] });
      toast({
        title: "Success",
        description: "Recurring pattern added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add recurring pattern",
        variant: "destructive",
      });
    },
  });
  
  const updateRecurringPatternMutation = useMutation({
    mutationFn: async ({ id, pattern }: { id: number, pattern: Partial<Omit<InsertRecurringPattern, "userId">> }) => {
      await apiRequest("PUT", `/api/recurring-patterns/${id}`, pattern);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-patterns"] });
      toast({
        title: "Success",
        description: "Recurring pattern updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update recurring pattern",
        variant: "destructive",
      });
    },
  });
  
  const deleteRecurringPatternMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/recurring-patterns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-patterns"] });
      toast({
        title: "Success",
        description: "Recurring pattern deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete recurring pattern",
        variant: "destructive",
      });
    },
  });
  
  // Generate calendar days based on the current view (month, week, or day)
  const generateCalendarDays = (): CalendarDay[] => {
    const today = new Date();
    const days: CalendarDay[] = [];

    // Helper to create a day object with patterns
    const createDayObject = (date: Date): CalendarDay => {
      const isToday = (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
      
      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
      
      // Get one-time work patterns for this day
      const oneTimePatterns = mode === "personal"
        ? workPatterns.filter(pattern => {
            const patternDate = new Date(pattern.date);
            return (
              patternDate.getDate() === date.getDate() &&
              patternDate.getMonth() === date.getMonth() &&
              patternDate.getFullYear() === date.getFullYear()
            );
          })
        : teamWorkPatterns.filter(pattern => {
            const patternDate = new Date(pattern.date);
            return (
              patternDate.getDate() === date.getDate() &&
              patternDate.getMonth() === date.getMonth() &&
              patternDate.getFullYear() === date.getFullYear()
            );
          });
      
      // Apply location filter if it's set
      const filteredOneTimePatterns = locationFilter 
        ? oneTimePatterns.filter(pattern => pattern.location === locationFilter)
        : oneTimePatterns;
      
      // Get recurring patterns for this day
      const weekday = date.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday
      
      const recurringForDay = mode === "personal"
        ? recurringPatterns.filter(pattern => {
            // Check if the recurring pattern applies to this day of the week
            return (
              (weekday === 0 && pattern.sunday) ||
              (weekday === 1 && pattern.monday) ||
              (weekday === 2 && pattern.tuesday) ||
              (weekday === 3 && pattern.wednesday) ||
              (weekday === 4 && pattern.thursday) ||
              (weekday === 5 && pattern.friday) ||
              (weekday === 6 && pattern.saturday)
            );
          })
        : []; // For team mode, we would need to fetch recurring patterns for all team members
      
      // Apply location filter to recurring patterns if it's set
      const filteredRecurringForDay = locationFilter
        ? recurringForDay.filter(pattern => pattern.location === locationFilter)
        : recurringForDay;
      
      // Convert recurring patterns to work patterns format for display
      const recurringAsWorkPatterns = filteredRecurringForDay.map(pattern => ({
        id: -pattern.id, // Use negative ID to avoid conflicts with real work patterns
        userId: pattern.userId,
        date: date,
        location: pattern.location,
        notes: pattern.notes,
        createdAt: pattern.createdAt
      }));
      
      // Combine both types of patterns
      const dayPatterns = [...filteredOneTimePatterns, ...recurringAsWorkPatterns];
      
      return {
        date,
        isCurrentMonth,
        isToday,
        workPatterns: dayPatterns,
      };
    };
    
    // Handle different views
    if (view === "month") {
      // For month view, show entire month grid (6 weeks)
      const daysInMonth = getDaysInMonth(currentDate);
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const startDay = getDay(firstDayOfMonth);
      
      // Add days from previous month to fill the first week
      const prevMonth = addMonths(firstDayOfMonth, -1);
      const daysInPrevMonth = getDaysInMonth(prevMonth);
      
      for (let i = startDay - 1; i >= 0; i--) {
        const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i);
        days.push(createDayObject(date));
      }
      
      // Add days from current month
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        days.push(createDayObject(date));
      }
      
      // Add days from next month to complete the grid (total of 42 cells for 6 weeks)
      const remainingDays = 42 - days.length;
      const nextMonth = addMonths(firstDayOfMonth, 1);
      
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i);
        days.push(createDayObject(date));
      }
    } 
    else if (view === "week") {
      // For week view, show 7 days starting from Monday
      const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
      
      for (let i = 0; i < 7; i++) {
        const date = addDays(startOfWeekDate, i);
        days.push(createDayObject(date));
      }
    } 
    else { // day view
      // For day view, show just the current day
      days.push(createDayObject(currentDate));
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  
  // Helper methods for mutations
  const addWorkPattern = async (pattern: Omit<InsertWorkPattern, "userId">) => {
    await addWorkPatternMutation.mutateAsync(pattern);
  };
  
  const updateWorkPattern = async (id: number, pattern: Partial<Omit<InsertWorkPattern, "userId">>) => {
    await updateWorkPatternMutation.mutateAsync({ id, pattern });
  };
  
  const deleteWorkPattern = async (id: number) => {
    await deleteWorkPatternMutation.mutateAsync(id);
  };
  
  const addRecurringPattern = async (pattern: Omit<InsertRecurringPattern, "userId">) => {
    await addRecurringPatternMutation.mutateAsync(pattern);
  };
  
  const updateRecurringPattern = async (id: number, pattern: Partial<Omit<InsertRecurringPattern, "userId">>) => {
    await updateRecurringPatternMutation.mutateAsync({ id, pattern });
  };
  
  const deleteRecurringPattern = async (id: number) => {
    await deleteRecurringPatternMutation.mutateAsync(id);
  };
  
  return (
    <CalendarContext.Provider
      value={{
        // State
        currentDate,
        view,
        mode,
        locationFilter,
        
        // Data
        workPatterns,
        recurringPatterns,
        isLoading: isWorkPatternsLoading || isRecurringPatternsLoading,
        teamWorkPatterns,
        isTeamLoading: isTeamPatternsLoading,
        
        // Calendar data
        calendarDays,
        
        // Actions
        setCurrentDate,
        setView,
        setMode,
        setLocationFilter,
        
        // Mutations
        addWorkPattern,
        updateWorkPattern,
        deleteWorkPattern,
        addRecurringPattern,
        updateRecurringPattern,
        deleteRecurringPattern,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
}
