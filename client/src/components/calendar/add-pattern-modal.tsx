import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { locationEnum, patternTypeEnum } from "@shared/schema";
import { useCalendar } from "@/hooks/use-calendar";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

type AddPatternModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AddPatternModal({ isOpen, onClose }: AddPatternModalProps) {
  const { addWorkPattern, addRecurringPattern } = useCalendar();
  const [patternType, setPatternType] = useState<"one_time" | "recurring">("one_time");
  const [date, setDate] = useState<Date>(new Date());
  const [location, setLocation] = useState<"home" | "office" | "other">("office");
  const [notes, setNotes] = useState<string>("");
  
  // For recurring patterns
  const [monday, setMonday] = useState<boolean>(true);
  const [tuesday, setTuesday] = useState<boolean>(true);
  const [wednesday, setWednesday] = useState<boolean>(true);
  const [thursday, setThursday] = useState<boolean>(true);
  const [friday, setFriday] = useState<boolean>(true);
  const [saturday, setSaturday] = useState<boolean>(false);
  const [sunday, setSunday] = useState<boolean>(false);
  
  // Reset form
  const resetForm = () => {
    setPatternType("one_time");
    setDate(new Date());
    setLocation("office");
    setNotes("");
    setMonday(true);
    setTuesday(true);
    setWednesday(true);
    setThursday(true);
    setFriday(true);
    setSaturday(false);
    setSunday(false);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (patternType === "one_time") {
      await addWorkPattern({
        date,
        location,
        notes,
      });
    } else {
      await addRecurringPattern({
        location,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        sunday,
        notes,
      });
    }
    
    resetForm();
    onClose();
  };
  
  // Handle cancel
  const handleCancel = () => {
    resetForm();
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start">
            <div className="mr-4 p-2 rounded-full bg-primary/10">
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">Add Work Pattern</DialogTitle>
              <DialogDescription className="mt-1">
                Set your regular work pattern for specific days or create a recurring schedule.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          {/* Pattern Type */}
          <div className="mb-4">
            <Label className="block text-sm font-medium text-gray-700 mb-1">Pattern Type</Label>
            <RadioGroup
              value={patternType}
              onValueChange={(value) => setPatternType(value as "one_time" | "recurring")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="one_time" id="one_time" />
                <Label htmlFor="one_time">One-time</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="recurring" id="recurring" />
                <Label htmlFor="recurring">Recurring</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Date Selection (for one-time patterns) */}
          {patternType === "one_time" && (
            <div className="mb-4">
              <Label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
          
          {/* Recurring Pattern (for recurring patterns) */}
          {patternType === "recurring" && (
            <div className="mb-4">
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Recurring Pattern
              </Label>
              <div className="grid grid-cols-7 gap-2">
                <Toggle 
                  pressed={sunday} 
                  onPressedChange={setSunday}
                  className="px-2 py-1 text-xs font-medium rounded-full"
                >
                  S
                </Toggle>
                <Toggle 
                  pressed={monday} 
                  onPressedChange={setMonday}
                  className="px-2 py-1 text-xs font-medium rounded-full"
                >
                  M
                </Toggle>
                <Toggle 
                  pressed={tuesday} 
                  onPressedChange={setTuesday}
                  className="px-2 py-1 text-xs font-medium rounded-full"
                >
                  T
                </Toggle>
                <Toggle 
                  pressed={wednesday} 
                  onPressedChange={setWednesday}
                  className="px-2 py-1 text-xs font-medium rounded-full"
                >
                  W
                </Toggle>
                <Toggle 
                  pressed={thursday} 
                  onPressedChange={setThursday}
                  className="px-2 py-1 text-xs font-medium rounded-full"
                >
                  T
                </Toggle>
                <Toggle 
                  pressed={friday} 
                  onPressedChange={setFriday}
                  className="px-2 py-1 text-xs font-medium rounded-full"
                >
                  F
                </Toggle>
                <Toggle 
                  pressed={saturday} 
                  onPressedChange={setSaturday}
                  className="px-2 py-1 text-xs font-medium rounded-full"
                >
                  S
                </Toggle>
              </div>
            </div>
          )}
          
          {/* Work Location */}
          <div className="mb-4">
            <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Work Location
            </Label>
            <Select 
              value={location} 
              onValueChange={(value) => setLocation(value as "home" | "office" | "other")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Notes */}
          <div className="mb-4">
            <Label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <DialogFooter className="sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button type="submit">
              Save Pattern
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
