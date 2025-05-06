import { useState } from "react";
import { CalendarDay } from "./calendar-day";
import { AddPatternModal } from "./add-pattern-modal";
import { EntryDetailModal } from "./entry-detail-modal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PlusIcon, Calendar, Filter, CalendarDays, Calendar as CalendarIcon, ChevronsUpDown } from "lucide-react";
import { useCalendar } from "@/hooks/use-calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkPattern } from "@shared/schema";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [patternToEdit, setPatternToEdit] = useState<WorkPattern | null>(null);

  const handleSelectDay = (date: Date) => {
    setSelectedDate(date);
    setDetailModalOpen(true);
  };

  const handleEditPattern = (pattern: WorkPattern) => {
    setPatternToEdit(pattern);
    setDetailModalOpen(false);
    setAddModalOpen(true);
  };

  return (
    <CalendarContent 
      isAddModalOpen={addModalOpen}
      onOpenAddModal={() => setAddModalOpen(true)}
      onCloseAddModal={() => {
        setAddModalOpen(false);
        setPatternToEdit(null);
      }}
      isDetailModalOpen={detailModalOpen}
      onOpenDetailModal={handleSelectDay}
      onCloseDetailModal={() => setDetailModalOpen(false)}
      selectedDate={selectedDate}
      patternToEdit={patternToEdit}
      onEditPattern={handleEditPattern}
    />
  );
}

function CalendarContent({ 
  isAddModalOpen, 
  onOpenAddModal, 
  onCloseAddModal,
  isDetailModalOpen,
  onOpenDetailModal,
  onCloseDetailModal,
  selectedDate,
  patternToEdit,
  onEditPattern
}: { 
  isAddModalOpen: boolean,
  onOpenAddModal: () => void,
  onCloseAddModal: () => void,
  isDetailModalOpen: boolean,
  onOpenDetailModal: (date: Date) => void,
  onCloseDetailModal: () => void,
  selectedDate: Date | null,
  patternToEdit: WorkPattern | null,
  onEditPattern: (pattern: WorkPattern) => void
}) {
  const { 
    calendarDays, 
    mode, 
    setMode,
    view,
    setView,
    locationFilter, 
    setLocationFilter,
    isLoading,
    recurringPatterns,
    currentDate,
    setCurrentDate
  } = useCalendar();
  
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Filter and View Controls */}
        <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          {/* View controls */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium text-gray-700">Calendar View:</Label>
              <div className="flex rounded-md border border-gray-200">
                <Button 
                  variant={view === "month" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setView("month")}
                  className="rounded-r-none"
                >
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Month
                </Button>
                <Button 
                  variant={view === "week" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setView("week")}
                  className="rounded-none border-x"
                >
                  <CalendarDays className="h-4 w-4 mr-1" />
                  Week
                </Button>
                <Button 
                  variant={view === "day" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setView("day")}
                  className="rounded-l-none"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Day
                </Button>
              </div>
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
        
        {/* Calendar View */}
        {isLoading ? (
          <CalendarSkeleton view={view as "month" | "week" | "day"} />
        ) : view === "day" ? (
          // Day view (list view like Outlook)
          <div className="space-y-4">
            {/* Day Navigation */}
            <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const prevDay = new Date(currentDate);
                  prevDay.setDate(prevDay.getDate() - 1);
                  setCurrentDate(prevDay);
                }}
              >
                Previous Day
              </Button>
              <div className="text-lg font-semibold">
                {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const nextDay = new Date(currentDate);
                  nextDay.setDate(nextDay.getDate() + 1);
                  setCurrentDate(nextDay);
                }}
              >
                Next Day
              </Button>
            </div>
            
            {/* Day Content */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {calendarDays.length > 0 && calendarDays[0].date && (
                <CalendarDay
                  date={calendarDays[0].date}
                  isCurrentMonth={true}
                  isToday={calendarDays[0].isToday}
                  workPatterns={calendarDays[0].workPatterns}
                  onClick={() => calendarDays[0].date && onOpenDetailModal(calendarDays[0].date)}
                  view="day"
                />
              )}
            </div>
          </div>
        ) : view === "week" ? (
          // Week view (7 days in a row)
          <div className="space-y-4">
            {/* Week Navigation */}
            <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const prevWeek = new Date(currentDate);
                  prevWeek.setDate(prevWeek.getDate() - 7);
                  setCurrentDate(prevWeek);
                }}
              >
                Previous Week
              </Button>
              <div className="text-lg font-semibold">
                {calendarDays.length >= 7 && calendarDays[0].date && calendarDays[6].date ? 
                  `${calendarDays[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${calendarDays[6].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` :
                  "Week View"
                }
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const nextWeek = new Date(currentDate);
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  setCurrentDate(nextWeek);
                }}
              >
                Next Week
              </Button>
            </div>
            
            {/* Week Content */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {weekdays.map((day) => (
                  <div key={day} className="bg-white px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days - only show the 7 days of the week */}
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {calendarDays.slice(0, 7).map((day, index) => (
                  <CalendarDay
                    key={index}
                    date={day.date}
                    isCurrentMonth={day.isCurrentMonth}
                    isToday={day.isToday}
                    workPatterns={day.workPatterns}
                    onClick={() => day.date && onOpenDetailModal(day.date)}
                    view="week"
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Month view (traditional calendar grid)
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
                  onClick={() => day.date && day.isCurrentMonth && onOpenDetailModal(day.date)}
                  view="month"
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
        initialPattern={patternToEdit}
      />
      
      {/* Entry Detail Modal */}
      {selectedDate && (
        <EntryDetailModal
          isOpen={isDetailModalOpen}
          onClose={onCloseDetailModal}
          date={selectedDate}
          patterns={selectedDate ? 
            calendarDays.find(day => 
              day.date?.getDate() === selectedDate.getDate() && 
              day.date?.getMonth() === selectedDate.getMonth() && 
              day.date?.getFullYear() === selectedDate.getFullYear()
            )?.workPatterns || [] 
            : []
          }
          recurringPatterns={recurringPatterns}
          onEditPattern={onEditPattern}
        />
      )}
    </main>
  );
}

function CalendarSkeleton({ view = "month" }: { view?: "month" | "week" | "day" }) {
  // For day view
  if (view === "day") {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
        
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="p-4">
              <div className="flex items-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="ml-4 space-y-2 flex-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // For week view
  if (view === "week") {
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
        
        {/* Calendar days skeleton - only 7 days for a week */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="min-h-[160px] bg-white p-2">
              <div className="text-right">
                <Skeleton className="h-4 w-4 ml-auto" />
              </div>
              <div className="mt-2 space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Default: month view
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
