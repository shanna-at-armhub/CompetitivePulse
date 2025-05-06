import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { WorkPattern } from "@shared/schema";
import { useCalendar } from "@/hooks/use-calendar";
import { useAuth } from "@/hooks/use-auth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

type CalendarDayProps = {
  date: Date | null;
  isCurrentMonth: boolean;
  isToday: boolean;
  workPatterns: WorkPattern[];
  onClick?: () => void;
  view?: "month" | "week" | "day";
};

type PatternWithUser = {
  id: number;
  userId: number;
  displayName: string;
  location: string;
  notes?: string | null;
  isPublicHoliday?: boolean;
  avatarUrl?: string | null;
};

export function CalendarDay({ 
  date, 
  isCurrentMonth, 
  isToday, 
  workPatterns,
  onClick,
  view = "month"
}: CalendarDayProps) {
  const { mode } = useCalendar();
  const { user } = useAuth();
  
  if (!date) return null;
  
  // Extract day number
  const dayNumber = date.getDate();
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Process patterns
  const processedPatterns: PatternWithUser[] = workPatterns.map(pattern => {
    // Public holiday or system pattern
    if (pattern.userId === 0) {
      return {
        id: pattern.id,
        userId: 0,
        displayName: pattern.notes || "Public Holiday",
        location: pattern.location,
        notes: pattern.notes,
        isPublicHoliday: true,
        avatarUrl: null
      };
    }
    
    // Current user's pattern
    if (pattern.userId === user?.id) {
      return {
        id: pattern.id,
        userId: user.id,
        displayName: user.displayName,
        location: pattern.location,
        notes: pattern.notes,
        avatarUrl: user.avatarUrl || null
      };
    }
    
    // Other user's pattern (from team view)
    return {
      id: pattern.id,
      userId: pattern.userId,
      displayName: (pattern as any).user?.displayName || `User ${pattern.userId}`,
      location: pattern.location,
      notes: pattern.notes,
      avatarUrl: (pattern as any).user?.avatarUrl || null
    };
  });
  
  // Check if there's a public holiday
  const publicHoliday = processedPatterns.find(p => p.isPublicHoliday);
  
  // Render a day view (detailed list view like Outlook with time slots)
  if (view === "day") {
    // Generate time slots from 8 AM to 6 PM
    const timeSlots = Array.from({ length: 11 }, (_, i) => 8 + i);
    
    return (
      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        <div className={cn(
          "py-3 px-4 bg-gray-50 border-b flex items-center justify-between",
          isToday && "bg-primary/10",
          publicHoliday && "bg-red-100"
        )}>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">{format(date, "EEEE")}</span>
            <span className="text-sm text-muted-foreground">{format(date, "MMMM d, yyyy")}</span>
          </div>
          {publicHoliday && (
            <Badge variant="destructive" className="ml-auto">
              {publicHoliday.notes || "Public Holiday"}
            </Badge>
          )}
        </div>
        
        {/* Time slots grid */}
        <div className="flex flex-col divide-y divide-gray-100">
          {/* All-day events (like public holidays and full day work patterns) */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex">
              <div className="w-20 flex-shrink-0 text-xs text-gray-500 pt-1">All day</div>
              <div className="flex-1 ml-2 bg-gray-50 rounded min-h-14 p-2">
                {publicHoliday ? (
                  <div className="bg-red-100 p-2 rounded border border-red-200 text-red-800 text-sm">
                    <span className="font-medium">{publicHoliday.notes || "Public Holiday"}</span>
                  </div>
                ) : processedPatterns.some(p => 
                    p.location === "annual_leave" || 
                    p.location === "personal_leave" || 
                    p.location === "public_holiday"
                  ) ? (
                  <div className="space-y-2">
                    {processedPatterns
                      .filter(p => 
                        p.location === "annual_leave" || 
                        p.location === "personal_leave" || 
                        p.location === "public_holiday"
                      )
                      .map((pattern) => (
                        <div key={pattern.id} className={cn(
                          "p-2 rounded border text-sm",
                          pattern.location === "annual_leave" && "bg-amber-100 border-amber-200 text-amber-800",
                          pattern.location === "personal_leave" && "bg-red-100 border-red-200 text-red-800",
                          pattern.location === "public_holiday" && "bg-red-100 border-red-200 text-red-800",
                        )}>
                          <div className="flex items-center">
                            <Avatar className="w-5 h-5 mr-2">
                              <AvatarImage src={pattern.avatarUrl || ""} alt={pattern.displayName} />
                              <AvatarFallback className="text-[10px]">{getInitials(pattern.displayName)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{pattern.displayName}</span>
                            <span className="ml-2">
                              {pattern.location === "annual_leave" ? "Annual Leave" :
                               pattern.location === "personal_leave" ? "Personal Leave" :
                               pattern.location === "public_holiday" ? "Public Holiday" : "Other"}
                            </span>
                            {pattern.notes && <span className="ml-2 text-xs italic">({pattern.notes})</span>}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    No all-day events
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Time slots */}
          {timeSlots.map(hour => (
            <div key={hour} className="p-3 hover:bg-gray-50 transition-colors">
              <div className="flex">
                <div className="w-20 flex-shrink-0 text-xs text-gray-500 pt-1">
                  {hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
                </div>
                <div className="flex-1 ml-2 min-h-14 rounded">
                  {processedPatterns
                    .filter(p => !p.isPublicHoliday && 
                             p.location !== "annual_leave" && 
                             p.location !== "personal_leave")
                    .map((pattern) => (
                      // Simple representation - in a real app, you'd have start and end times
                      // For this example, we'll spread work patterns across the day
                      <div key={pattern.id} className={cn(
                        "p-2 rounded border mb-2",
                        pattern.location === "office" && "bg-green-50 border-green-200",
                        pattern.location === "home" && "bg-blue-50 border-blue-200",
                        pattern.location === "other" && "bg-gray-50 border-gray-200"
                      )}>
                        <div className="flex items-center">
                          <Avatar className={cn(
                            "w-6 h-6 mr-2",
                            pattern.location === "office" && "ring-1 ring-[#10b981]",
                            pattern.location === "home" && "ring-1 ring-[#3b82f6]",
                            pattern.location === "other" && "ring-1 ring-gray-400"
                          )}>
                            <AvatarImage src={pattern.avatarUrl || ""} alt={pattern.displayName} />
                            <AvatarFallback className="text-[10px]">{getInitials(pattern.displayName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="text-sm font-medium">{pattern.displayName}</span>
                            <span className="ml-2 text-xs">
                              {pattern.location === "office" ? "Office" :
                               pattern.location === "home" ? "Home" : "Other"}
                            </span>
                            {pattern.notes && <span className="ml-1 text-xs italic">({pattern.notes})</span>}
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Render a month/week view (calendar grid cell)
  return (
    <TooltipProvider>
      <div 
        className={cn(
          "min-h-[120px] bg-white p-2 transition-all border",
          view === "week" && "min-h-[160px]",
          !isCurrentMonth && "text-gray-300 opacity-70",
          isToday && "ring-2 ring-primary",
          publicHoliday && "bg-red-50",
          "cursor-pointer hover:bg-gray-50"
        )}
        onClick={onClick}
      >
        <div className={cn(
          "text-right font-medium",
          isToday && "font-semibold text-primary"
        )}>
          {dayNumber}
        </div>
        
        {/* Public Holiday banner */}
        {publicHoliday && (
          <div className="mt-1 w-full">
            <Badge variant="destructive" className="w-full justify-center py-0 text-xs">
              {publicHoliday.notes || "Public Holiday"}
            </Badge>
          </div>
        )}
        
        {isCurrentMonth && processedPatterns.length > 0 && (
          <div className="mt-2 flex flex-col space-y-1">
            {processedPatterns
              .filter(p => !p.isPublicHoliday) // Skip public holidays as they're shown above
              .map((pattern) => (
                <Tooltip key={pattern.id}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <Avatar className={cn(
                        "w-6 h-6 ring-2",
                        pattern.location === "office" && "ring-[#10b981]",
                        pattern.location === "home" && "ring-[#3b82f6]",
                        pattern.location === "annual_leave" && "ring-[#f59e0b]",
                        pattern.location === "personal_leave" && "ring-[#ef4444]",
                        pattern.location === "other" && "ring-gray-400"
                      )}>
                        <AvatarImage 
                          src={pattern.avatarUrl || ""} 
                          alt={pattern.displayName} 
                        />
                        <AvatarFallback className="text-[10px]">
                          {getInitials(pattern.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-1 flex flex-col">
                        <span className="text-xs text-gray-700 truncate">
                          {pattern.displayName}
                        </span>
                        <span className="text-[10px] font-medium truncate" style={{
                          color: pattern.location === "office" ? "#059669" : 
                                 pattern.location === "home" ? "#2563eb" :
                                 pattern.location === "annual_leave" ? "#d97706" :
                                 pattern.location === "personal_leave" ? "#dc2626" : 
                                 "#6b7280"
                        }}>
                          {pattern.location === "office" ? "Office" :
                           pattern.location === "home" ? "Home" :
                           pattern.location === "annual_leave" ? "Annual Leave" :
                           pattern.location === "personal_leave" ? "Personal Leave" :
                           pattern.location === "public_holiday" ? "Public Holiday" : "Other"}
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <p className="font-medium">{pattern.displayName}</p>
                      <p className="text-muted-foreground">
                        {pattern.location === "office" && "Working from Office"}
                        {pattern.location === "home" && "Working from Home"}
                        {pattern.location === "annual_leave" && "Annual Leave"}
                        {pattern.location === "personal_leave" && "Personal Leave"}
                        {pattern.location === "other" && "Other Location"}
                      </p>
                      {pattern.notes && <p className="mt-1 text-xs">{pattern.notes}</p>}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))
            }
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
