import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { WorkPattern } from "@shared/schema";
import { useCalendar } from "@/hooks/use-calendar";
import { useAuth } from "@/hooks/use-auth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type CalendarDayProps = {
  date: Date | null;
  isCurrentMonth: boolean;
  isToday: boolean;
  workPatterns: WorkPattern[];
  onClick?: () => void;
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
  onClick
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
  
  return (
    <TooltipProvider>
      <div 
        className={cn(
          "min-h-[120px] bg-white p-2 transition-all",
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
                      <span className="ml-1 text-xs text-gray-700 truncate">
                        {pattern.displayName}
                      </span>
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
