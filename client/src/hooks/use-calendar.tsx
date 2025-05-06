import { createContext, ReactNode, useContext, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { WorkPattern, RecurringPattern, InsertWorkPattern, InsertRecurringPattern } from "@shared/schema";
import { format, startOfMonth, endOfMonth, addMonths, getDay, getDaysInMonth } from "date-fns";
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
  
  // Calculate date range for queries
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  
  // Fetch personal work patterns
  const {
    data: workPatterns = [],
    isLoading: isWorkPatternsLoading
  } = useQuery<WorkPattern[]>({
    queryKey: ["/api/work-patterns", { startDate: format(startDate, "yyyy-MM-dd"), endDate: format(endDate, "yyyy-MM-dd") }],
    enabled: !!user,
  });
  
  // Fetch recurring patterns
  const {
    data: recurringPatterns = [],
    isLoading: isRecurringPatternsLoading
  } = useQuery<RecurringPattern[]>({
    queryKey: ["/api/recurring-patterns"],
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
    enabled: !!user && mode === "team",
  });
  
  // Mutations for work patterns
  const addWorkPatternMutation = useMutation({
    mutationFn: async (pattern: Omit<InsertWorkPattern, "userId">) => {
      await apiRequest("POST", "/api/work-patterns", pattern);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-patterns"] });
      toast({
        title: "Success",
        description: "Work pattern added successfully",
      });
    },
    onError: (error: Error) => {
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
  
  // Generate calendar days for the current month view
  const generateCalendarDays = (): CalendarDay[] => {
    const today = new Date();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startDay = getDay(firstDayOfMonth);
    
    const days: CalendarDay[] = [];
    
    // Add days from previous month to fill the first week
    const prevMonth = addMonths(firstDayOfMonth, -1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        workPatterns: [],
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const isToday = (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
      
      // Get work patterns for this day
      const dayPatterns = mode === "personal"
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
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        workPatterns: dayPatterns,
      });
    }
    
    // Add days from next month to complete the grid (total of 42 cells for 6 weeks)
    const remainingDays = 42 - days.length;
    const nextMonth = addMonths(firstDayOfMonth, 1);
    
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        workPatterns: [],
      });
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
