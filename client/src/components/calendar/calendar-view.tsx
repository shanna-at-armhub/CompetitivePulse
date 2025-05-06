import { useState } from "react";
import { CalendarDay } from "./calendar-day";
import { AddPatternModal } from "./add-pattern-modal";
import { EntryDetailModal } from "./entry-detail-modal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PlusIcon, Calendar, Filter, CalendarDays, Calendar as CalendarIcon, ChevronsUpDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCalendar } from "@/hooks/use-calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkPattern } from "@shared/schema";
import { format, addDays, subDays, addWeeks, subWeeks } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

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
  
  // Filter dialog state (only for dialog open state)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  
  // Get filter states and setters from the useCalendar hook
  const { 
    showPublicHolidays, 
    setShowPublicHolidays,
    showRecurringPatterns, 
    setShowRecurringPatterns,
    showOneTimePatterns, 
    setShowOneTimePatterns 
  } = useCalendar();
  
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-[10px]">
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
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center"
              onClick={() => setFilterDialogOpen(true)}
            >
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
                onClick={() => setCurrentDate(subDays(currentDate, 1))}
              >
                Previous Day
              </Button>
              <div className="text-lg font-semibold">
                {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentDate(addDays(currentDate, 1))}
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
                onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
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
                onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
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
      
      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Advanced Filters
            </DialogTitle>
            <DialogDescription>
              Customize which types of work patterns appear on your calendar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="show-public-holidays" 
                checked={showPublicHolidays}
                onCheckedChange={(checked) => setShowPublicHolidays(!!checked)}
              />
              <div className="space-y-1">
                <Label 
                  htmlFor="show-public-holidays" 
                  className="font-medium"
                >
                  Show Public Holidays
                </Label>
                <p className="text-sm text-muted-foreground">
                  Display Queensland public holidays on the calendar
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="show-recurring" 
                checked={showRecurringPatterns}
                onCheckedChange={(checked) => setShowRecurringPatterns(!!checked)}
              />
              <div className="space-y-1">
                <Label 
                  htmlFor="show-recurring" 
                  className="font-medium"
                >
                  Show Recurring Patterns
                </Label>
                <p className="text-sm text-muted-foreground">
                  Display patterns that repeat weekly (e.g., office on Mondays)
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="show-one-time" 
                checked={showOneTimePatterns}
                onCheckedChange={(checked) => setShowOneTimePatterns(!!checked)}
              />
              <div className="space-y-1">
                <Label 
                  htmlFor="show-one-time" 
                  className="font-medium"
                >
                  Show One-Time Patterns
                </Label>
                <p className="text-sm text-muted-foreground">
                  Display patterns that occur only once (e.g., annual leave)
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setFilterDialogOpen(false)}>
              Close
            </Button>
            <Button 
              type="submit" 
              onClick={() => {
                // Filters are automatically applied via state
                // No need for additional API calls
                setFilterDialogOpen(false);
              }}
            >
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
