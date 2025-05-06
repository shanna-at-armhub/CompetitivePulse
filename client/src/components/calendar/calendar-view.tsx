import { useState } from "react";
import { CalendarDay } from "./calendar-day";
import { AddPatternModal } from "./add-pattern-modal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PlusIcon, Filter, CalendarCheck } from "lucide-react";
import { useCalendar } from "@/hooks/use-calendar";
import { CalendarProvider } from "@/hooks/use-calendar";
import { Skeleton } from "@/components/ui/skeleton";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView() {
  const [addModalOpen, setAddModalOpen] = useState(false);

  return (
    <CalendarProvider>
      <CalendarContent 
        isAddModalOpen={addModalOpen}
        onOpenAddModal={() => setAddModalOpen(true)}
        onCloseAddModal={() => setAddModalOpen(false)}
      />
    </CalendarProvider>
  );
}

function CalendarContent({ 
  isAddModalOpen, 
  onOpenAddModal, 
  onCloseAddModal 
}: { 
  isAddModalOpen: boolean,
  onOpenAddModal: () => void,
  onCloseAddModal: () => void
}) {
  const { 
    calendarDays, 
    mode, 
    setMode, 
    locationFilter, 
    setLocationFilter,
    isLoading
  } = useCalendar();
  
  const handleDayClick = (date: Date) => {
    // In a real app, you might want to navigate to day view or open edit modal
    console.log("Day clicked:", date);
  };
  
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Filter and View Controls */}
        <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          {/* View controls */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center">
              <Label className="mr-2 text-sm font-medium text-gray-700">View:</Label>
              <Select defaultValue="team">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">My calendar</SelectItem>
                  <SelectItem value="team">Team calendar</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Toggle between personal/team view */}
            <div className="flex items-center space-x-2">
              <Label className={mode === "personal" ? "text-primary font-medium" : "text-gray-700"}>
                Personal
              </Label>
              <Switch 
                checked={mode === "team"} 
                onCheckedChange={(checked) => setMode(checked ? "team" : "personal")} 
              />
              <Label className={mode === "team" ? "text-primary font-medium" : "text-gray-700"}>
                Team
              </Label>
            </div>
          </div>
          
          {/* Filter controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium text-gray-700">Location:</Label>
              <Select 
                value={locationFilter || "all_locations"} 
                onValueChange={(value) => setLocationFilter(value === "all_locations" ? null : value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_locations">All locations</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" size="sm" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">More filters</span>
            </Button>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Legend:</span>
          <div className="flex items-center">
            <div className="h-4 w-4 rounded bg-[#10b981] mr-2"></div>
            <span className="text-sm text-gray-700">Office</span>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 rounded bg-[#f97316] mr-2"></div>
            <span className="text-sm text-gray-700">Home</span>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 rounded bg-gray-200 mr-2"></div>
            <span className="text-sm text-gray-700">Not set</span>
          </div>
        </div>
        
        {/* Calendar Grid */}
        {isLoading ? (
          <CalendarSkeleton />
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {weekdays.map((day) => (
                <div key={day} className="bg-white px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {calendarDays.map((day, index) => (
                <CalendarDay
                  key={index}
                  date={day.date}
                  isCurrentMonth={day.isCurrentMonth}
                  isToday={day.isToday}
                  workPatterns={day.workPatterns}
                  onClick={() => day.date && day.isCurrentMonth && handleDayClick(day.date)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Add New Work Pattern Button (Fixed) */}
      <div className="fixed bottom-4 right-4">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={onOpenAddModal}
        >
          <PlusIcon className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Add Pattern Modal */}
      <AddPatternModal 
        isOpen={isAddModalOpen}
        onClose={onCloseAddModal}
      />
    </main>
  );
}

function CalendarSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {weekdays.map((day) => (
          <div key={day} className="bg-white px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar days skeleton */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {Array.from({ length: 35 }).map((_, index) => (
          <div key={index} className="min-h-[120px] bg-white p-2">
            <div className="text-right">
              <Skeleton className="h-4 w-4 ml-auto" />
            </div>
            <div className="mt-2 space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
