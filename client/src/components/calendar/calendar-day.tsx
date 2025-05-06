import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WorkPattern } from "@shared/schema";
import { useCalendar } from "@/hooks/use-calendar";
import { User } from "@shared/schema";

type CalendarDayProps = {
  date: Date | null;
  isCurrentMonth: boolean;
  isToday: boolean;
  workPatterns: WorkPattern[];
  onClick?: () => void;
};

type UserWithPattern = {
  user: {
    id: number;
    displayName: string;
    avatarUrl?: string;
  };
  location: string;
}

export function CalendarDay({ 
  date, 
  isCurrentMonth, 
  isToday, 
  workPatterns,
  onClick
}: CalendarDayProps) {
  const { mode } = useCalendar();
  
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
  
  // Map patterns to include user data
  const patternsWithUsers = workPatterns.map(pattern => ({
    user: {
      id: pattern.userId,
      displayName: "User " + pattern.userId, // This would be replaced with actual user data in a real app
      avatarUrl: undefined
    },
    location: pattern.location
  }));
  
  return (
    <div 
      className={cn(
        "min-h-[120px] bg-white p-2 transition-all",
        !isCurrentMonth && "text-gray-300",
        isToday && "ring-2 ring-primary",
        "cursor-pointer hover:bg-gray-50"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "text-right",
        isToday && "font-semibold text-primary"
      )}>
        {dayNumber}
      </div>
      
      {isCurrentMonth && workPatterns.length > 0 && (
        <div className="mt-2 flex flex-col space-y-1">
          {patternsWithUsers.map((item, index) => (
            <div key={index} className="flex items-center">
              <Avatar className={cn(
                "w-6 h-6 ring-2",
                item.location === "office" && "ring-[#10b981]",
                item.location === "home" && "ring-[#f97316]",
                item.location === "other" && "ring-gray-400"
              )}>
                <AvatarImage 
                  src={item.user.avatarUrl || ""} 
                  alt={item.user.displayName} 
                />
                <AvatarFallback className="text-[10px]">
                  {getInitials(item.user.displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="ml-1 text-xs text-gray-700 truncate">
                {item.user.displayName}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
