import { useState } from "react";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, CalendarIcon } from "lucide-react";
import { WorkPattern, RecurringPattern } from "@shared/schema";
import { useCalendar } from "@/hooks/use-calendar";

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
  onEditPattern,
}: EntryDetailModalProps) {
  const { deleteWorkPattern, deleteRecurringPattern } = useCalendar();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [patternToDelete, setPatternToDelete] = useState<{id: number, type: 'one-time' | 'recurring'} | null>(null);
  
  // Filter recurring patterns to show only those active on this day of the week
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const activeRecurringPatterns = recurringPatterns.filter(pattern => {
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
  
  const locationLabel = (location: string) => {
    switch (location) {
      case 'home': return 'Home';
      case 'office': return 'Office';
      case 'annual_leave': return 'Annual Leave';
      case 'personal_leave': return 'Personal Leave';
      case 'public_holiday': return 'Public Holiday';
      case 'other': return 'Other';
      default: return location;
    }
  };
  
  const locationColor = (location: string) => {
    switch (location) {
      case 'home': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'office': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'annual_leave': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'personal_leave': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'public_holiday': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'other': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const handleDelete = async () => {
    if (!patternToDelete) return;
    
    try {
      if (patternToDelete.type === 'one-time') {
        await deleteWorkPattern(patternToDelete.id);
      } else {
        await deleteRecurringPattern(patternToDelete.id);
      }
      setIsDeleteAlertOpen(false);
      setPatternToDelete(null);
    } catch (error) {
      console.error("Error deleting pattern:", error);
    }
  };
  
  const confirmDelete = (id: number, type: 'one-time' | 'recurring') => {
    setPatternToDelete({ id, type });
    setIsDeleteAlertOpen(true);
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-start">
              <div className="mr-4 p-2 rounded-full bg-primary/10">
                <CalendarIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg">
                  {format(date, "EEEE, MMMM do, yyyy")}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Work pattern details for this date
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <Tabs defaultValue="one-time" className="mt-4">
            <TabsList className="w-full">
              <TabsTrigger value="one-time" className="flex-1">One-time Entries</TabsTrigger>
              <TabsTrigger value="recurring" className="flex-1">Recurring Patterns</TabsTrigger>
            </TabsList>
            
            <TabsContent value="one-time" className="mt-4">
              {patterns.length > 0 ? (
                <ScrollArea className="h-[300px] rounded-md border p-4">
                  <div className="space-y-4">
                    {patterns.map(pattern => (
                      <div key={pattern.id} className="rounded-md border p-4">
                        <div className="flex justify-between items-start mb-2">
                          <Badge 
                            variant="outline" 
                            className={`${locationColor(pattern.location)}`}
                          >
                            {locationLabel(pattern.location)}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => onEditPattern(pattern)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive" 
                              onClick={() => confirmDelete(pattern.id, 'one-time')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {pattern.notes && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">Notes:</p>
                            <p>{pattern.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No one-time entries for this date.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recurring" className="mt-4">
              {activeRecurringPatterns.length > 0 ? (
                <ScrollArea className="h-[300px] rounded-md border p-4">
                  <div className="space-y-4">
                    {activeRecurringPatterns.map(pattern => (
                      <div key={pattern.id} className="rounded-md border p-4">
                        <div className="flex justify-between items-start mb-2">
                          <Badge 
                            variant="outline" 
                            className={`${locationColor(pattern.location)}`}
                          >
                            {locationLabel(pattern.location)}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive" 
                              onClick={() => confirmDelete(pattern.id, 'recurring')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-sm grid grid-cols-7 gap-1">
                          <div className={`text-center rounded-full w-6 h-6 ${pattern.sunday ? 'bg-primary/20 font-medium' : 'bg-muted'}`}>S</div>
                          <div className={`text-center rounded-full w-6 h-6 ${pattern.monday ? 'bg-primary/20 font-medium' : 'bg-muted'}`}>M</div>
                          <div className={`text-center rounded-full w-6 h-6 ${pattern.tuesday ? 'bg-primary/20 font-medium' : 'bg-muted'}`}>T</div>
                          <div className={`text-center rounded-full w-6 h-6 ${pattern.wednesday ? 'bg-primary/20 font-medium' : 'bg-muted'}`}>W</div>
                          <div className={`text-center rounded-full w-6 h-6 ${pattern.thursday ? 'bg-primary/20 font-medium' : 'bg-muted'}`}>T</div>
                          <div className={`text-center rounded-full w-6 h-6 ${pattern.friday ? 'bg-primary/20 font-medium' : 'bg-muted'}`}>F</div>
                          <div className={`text-center rounded-full w-6 h-6 ${pattern.saturday ? 'bg-primary/20 font-medium' : 'bg-muted'}`}>S</div>
                        </div>
                        
                        {pattern.notes && (
                          <div className="mt-3 text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">Notes:</p>
                            <p>{pattern.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recurring patterns active on this day.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this work pattern.
              {patternToDelete?.type === 'recurring' && " This will affect all days where this recurring pattern applies."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
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