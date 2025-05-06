import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, CalendarIcon, Trash2, Edit, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WorkPattern, RecurringPattern } from "@shared/schema";
import { useCalendar } from "@/hooks/use-calendar";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type EntryDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  patterns: WorkPattern[];
  recurringPatterns: RecurringPattern[];
  onEditPattern: (pattern: WorkPattern) => void;
};

export function EntryDetailModal({ 
  isOpen, 
  onClose, 
  date, 
  patterns,
  recurringPatterns,
  onEditPattern
}: EntryDetailModalProps) {
  const { deleteWorkPattern, deleteRecurringPattern } = useCalendar();
  const [activeTab, setActiveTab] = useState<"one-time" | "recurring">("one-time");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [patternToDelete, setPatternToDelete] = useState<{ id: number, type: "one-time" | "recurring" } | null>(null);

  // Handle deletion confirmation
  const handleDeleteClick = (id: number, type: "one-time" | "recurring") => {
    setPatternToDelete({ id, type });
    setDeleteConfirmOpen(true);
  };

  // Process the actual deletion
  const handleConfirmDelete = async () => {
    if (!patternToDelete) return;
    
    try {
      if (patternToDelete.type === "one-time") {
        await deleteWorkPattern(patternToDelete.id);
      } else {
        await deleteRecurringPattern(patternToDelete.id);
      }
      setDeleteConfirmOpen(false);
      setPatternToDelete(null);
    } catch (error) {
      console.error("Error deleting pattern:", error);
    }
  };
  
  // Get day of week for the selected date
  const dayOfWeek = date.getDay(); // 0-6, where 0 is Sunday
  
  // Filter recurring patterns that apply to this day of week
  const applicableRecurringPatterns = recurringPatterns.filter(pattern => {
    switch (dayOfWeek) {
      case 0: return pattern.sunday;
      case 1: return pattern.monday;
      case 2: return pattern.tuesday;
      case 3: return pattern.wednesday;
      case 4: return pattern.thursday;
      case 5: return pattern.friday;
      case 6: return pattern.saturday;
      default: return false;
    }
  });
  
  // Get color based on location
  const getLocationColor = (location: string) => {
    switch (location) {
      case "office": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "home": return "bg-blue-100 text-blue-800 border-blue-200";
      case "annual_leave": return "bg-amber-100 text-amber-800 border-amber-200";
      case "personal_leave": return "bg-red-100 text-red-800 border-red-200";
      case "public_holiday": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  // Get readable location name
  const getLocationName = (location: string) => {
    switch (location) {
      case "office": return "Office";
      case "home": return "Home";
      case "annual_leave": return "Annual Leave";
      case "personal_leave": return "Personal Leave";
      case "public_holiday": return "Public Holiday";
      default: return "Other";
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-start mb-4">
              <div className="mr-4 p-2 rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg">
                  {date && format(date, "EEEE, MMMM d, yyyy")}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  View and manage work patterns for this date.
                </DialogDescription>
              </div>
            </div>
            
            <Tabs defaultValue="one-time" onValueChange={(value) => setActiveTab(value as "one-time" | "recurring")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="one-time">One-time Entries</TabsTrigger>
                <TabsTrigger value="recurring">Recurring Patterns</TabsTrigger>
              </TabsList>
              
              <TabsContent value="one-time" className="mt-4">
                <div className="space-y-4">
                  {patterns.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                      <p className="mb-1">No entries for this date</p>
                      <p className="text-sm">
                        Click the "+" button to add a work pattern for this date.
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="max-h-[300px]">
                      {patterns.map((pattern) => (
                        <div 
                          key={pattern.id} 
                          className="p-4 border rounded-lg mb-3 shadow-sm relative group"
                        >
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => onEditPattern(pattern)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(pattern.id, "one-time")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <Badge variant="outline" className={cn("font-normal", getLocationColor(pattern.location))}>
                              {getLocationName(pattern.location)}
                            </Badge>
                          </div>
                          
                          {pattern.notes && (
                            <div className="mt-2 text-sm text-gray-600">
                              <p>{pattern.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </ScrollArea>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="recurring" className="mt-4">
                <div className="space-y-4">
                  {applicableRecurringPatterns.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                      <p className="mb-1">No recurring patterns for this day</p>
                      <p className="text-sm">
                        Click the "+" button to add a recurring pattern that includes this day.
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="max-h-[300px]">
                      {applicableRecurringPatterns.map((pattern) => (
                        <div 
                          key={pattern.id} 
                          className="p-4 border rounded-lg mb-3 shadow-sm relative group"
                        >
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(pattern.id, "recurring")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <Badge variant="outline" className={cn("font-normal", getLocationColor(pattern.location))}>
                              {getLocationName(pattern.location)}
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                              Recurring
                            </Badge>
                          </div>
                          
                          <div className="mt-2 text-sm text-gray-700">
                            <div className="mb-1 font-medium">Days:</div>
                            <div className="flex gap-1">
                              <Badge 
                                variant={pattern.monday ? "default" : "outline"} 
                                className="w-7 h-7 rounded-full flex items-center justify-center"
                              >
                                M
                              </Badge>
                              <Badge 
                                variant={pattern.tuesday ? "default" : "outline"} 
                                className="w-7 h-7 rounded-full flex items-center justify-center"
                              >
                                T
                              </Badge>
                              <Badge 
                                variant={pattern.wednesday ? "default" : "outline"} 
                                className="w-7 h-7 rounded-full flex items-center justify-center"
                              >
                                W
                              </Badge>
                              <Badge 
                                variant={pattern.thursday ? "default" : "outline"} 
                                className="w-7 h-7 rounded-full flex items-center justify-center"
                              >
                                T
                              </Badge>
                              <Badge 
                                variant={pattern.friday ? "default" : "outline"} 
                                className="w-7 h-7 rounded-full flex items-center justify-center"
                              >
                                F
                              </Badge>
                              <Badge 
                                variant={pattern.saturday ? "default" : "outline"} 
                                className="w-7 h-7 rounded-full flex items-center justify-center"
                              >
                                S
                              </Badge>
                              <Badge 
                                variant={pattern.sunday ? "default" : "outline"} 
                                className="w-7 h-7 rounded-full flex items-center justify-center"
                              >
                                S
                              </Badge>
                            </div>
                          </div>
                          
                          {pattern.notes && (
                            <div className="mt-2 text-sm text-gray-600">
                              <p>{pattern.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </ScrollArea>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogHeader>
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this work pattern. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPatternToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}