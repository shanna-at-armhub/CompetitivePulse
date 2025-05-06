import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCalendar } from "@/hooks/use-calendar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Calendar, UserRound, Settings, Trash2, Edit2, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { User, WorkPattern, RecurringPattern, locationEnum } from "@shared/schema";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  return (
    <div className="container max-w-6xl py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => window.location.href = "/"}
        >
          <Calendar className="h-4 w-4" />
          <span>Back to Calendar</span>
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Calendar Entries</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Preferences</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <UserProfileSection user={user} />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <CalendarEntriesSection />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <PreferencesSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UserProfileSection({ user }: { user: User | null }) {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setDisplayName(user.displayName || "");
      setEmail(user.email || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const response = await apiRequest("PATCH", "/api/user", {
        username,
        displayName,
        email,
        avatarUrl
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        setIsEditing(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Loading user profile...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your personal information</CardDescription>
        </div>
        <Button 
          variant={isEditing ? "default" : "outline"} 
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="h-32 w-32">
              <AvatarImage src={user.avatarUrl || ""} alt={user.displayName || user.username} />
              <AvatarFallback className="text-2xl">
                {(user.displayName || user.username || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <div className="w-full">
                <Label htmlFor="avatarUrl" className="text-xs text-muted-foreground">
                  Avatar URL
                </Label>
                <Input
                  id="avatarUrl"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrl || ""}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="displayName" className="text-sm font-medium">
                Display Name
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            
            <div className="pt-2">
              <Badge variant="outline">
                {user.role === "admin" ? "Administrator" : "User"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
      {isEditing && (
        <CardFooter className="flex justify-end border-t px-6 py-4">
          <Button 
            variant="default" 
            onClick={handleSaveProfile}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function CalendarEntriesSection() {
  const { workPatterns, recurringPatterns, isLoading, deleteWorkPattern, deleteRecurringPattern } = useCalendar();
  const [tab, setTab] = useState<"one-time" | "recurring">("one-time");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [selectedPatterns, setSelectedPatterns] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const { toast } = useToast();
  const [refreshPublicHolidays, setRefreshPublicHolidays] = useState(false);
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      if (tab === "one-time") {
        setSelectedPatterns(workPatterns.map(pattern => pattern.id));
      } else {
        setSelectedPatterns(recurringPatterns.map(pattern => pattern.id));
      }
    } else {
      setSelectedPatterns([]);
    }
  };

  // Handle individual checkbox
  const handleSelectPattern = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedPatterns(prev => [...prev, id]);
    } else {
      setSelectedPatterns(prev => prev.filter(patternId => patternId !== id));
    }
  };

  // Delete selected patterns
  const handleDeleteSelected = async () => {
    if (selectedPatterns.length === 0) return;
    
    try {
      if (tab === "one-time") {
        await Promise.all(selectedPatterns.map(id => deleteWorkPattern(id)));
      } else {
        await Promise.all(selectedPatterns.map(id => deleteRecurringPattern(id)));
      }
      
      toast({
        title: "Patterns deleted",
        description: `Successfully deleted ${selectedPatterns.length} patterns.`,
        variant: "default",
      });
      
      setSelectedPatterns([]);
      setSelectAll(false);
      setIsConfirmingDelete(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete selected patterns.",
        variant: "destructive",
      });
    }
  };

  // Get location color and name
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

  // Handle refreshing public holidays
  const handleRefreshPublicHolidays = async () => {
    setRefreshPublicHolidays(true);
    try {
      const response = await apiRequest("POST", "/api/refresh-holidays", {});
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/work-patterns"] });
        toast({
          title: "Public holidays refreshed",
          description: "Queensland public holidays have been added to your calendar.",
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to refresh public holidays");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to refresh public holidays",
        variant: "destructive",
      });
    } finally {
      setRefreshPublicHolidays(false);
    }
  };

  return (
    <>
      <Dialog 
        open={showAddEntryModal} 
        onOpenChange={(open) => !open && setShowAddEntryModal(false)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Calendar Entry</DialogTitle>
            <DialogDescription>
              Create a new work pattern or recurring entry
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="one-time" className="pt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="one-time">One-time Entry</TabsTrigger>
              <TabsTrigger value="recurring">Recurring Pattern</TabsTrigger>
            </TabsList>
            <TabsContent value="one-time">
              <OneTimeEntryForm onClose={() => setShowAddEntryModal(false)} />
            </TabsContent>
            <TabsContent value="recurring">
              <RecurringPatternForm onClose={() => setShowAddEntryModal(false)} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Calendar Entries</CardTitle>
            <CardDescription>Manage your work patterns and recurring entries</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setShowAddEntryModal(true)}
              className="flex items-center gap-1"
            >
              <Calendar className="h-4 w-4" />
              Add Entry
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefreshPublicHolidays}
              disabled={refreshPublicHolidays}
              className="flex items-center gap-1"
            >
              <RefreshCcw className="h-4 w-4" />
              {refreshPublicHolidays ? "Refreshing..." : "Refresh QLD Holidays"}
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              disabled={selectedPatterns.length === 0}
              onClick={() => setIsConfirmingDelete(true)}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="one-time" className="space-y-4" onValueChange={(value) => {
            setTab(value as "one-time" | "recurring");
            setSelectedPatterns([]);
            setSelectAll(false);
          }}>
            <TabsList>
              <TabsTrigger value="one-time">One-time Entries</TabsTrigger>
              <TabsTrigger value="recurring">Recurring Patterns</TabsTrigger>
            </TabsList>
            
            <TabsContent value="one-time">
              {isLoading ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2 animate-spin" />
                  <p>Loading work patterns...</p>
                </div>
              ) : workPatterns.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-lg font-medium mb-1">No one-time entries found</p>
                  <p className="text-muted-foreground">
                    Add entries from the calendar view to see them here.
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              checked={selectAll}
                              onChange={(e) => handleSelectAll(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </div>
                        </TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workPatterns
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((pattern) => {
                          const patternDate = new Date(pattern.date);
                          return (
                            <TableRow key={pattern.id}>
                              <TableCell>
                                <input 
                                  type="checkbox" 
                                  checked={selectedPatterns.includes(pattern.id)}
                                  onChange={(e) => handleSelectPattern(pattern.id, e.target.checked)}
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                              </TableCell>
                              <TableCell>{format(patternDate, "EEEE, MMMM d, yyyy")}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn("font-normal", getLocationColor(pattern.location))}>
                                  {getLocationName(pattern.location)}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {pattern.notes || "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => deleteWorkPattern(pattern.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recurring">
              {isLoading ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2 animate-spin" />
                  <p>Loading recurring patterns...</p>
                </div>
              ) : recurringPatterns.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-lg font-medium mb-1">No recurring patterns found</p>
                  <p className="text-muted-foreground">
                    Add recurring patterns from the calendar view to see them here.
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              checked={selectAll}
                              onChange={(e) => handleSelectAll(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </div>
                        </TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recurringPatterns.map((pattern) => (
                        <TableRow key={pattern.id}>
                          <TableCell>
                            <input 
                              type="checkbox" 
                              checked={selectedPatterns.includes(pattern.id)}
                              onChange={(e) => handleSelectPattern(pattern.id, e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Badge variant={pattern.monday ? "default" : "outline"} className="w-6 h-6 rounded-full flex items-center justify-center">M</Badge>
                              <Badge variant={pattern.tuesday ? "default" : "outline"} className="w-6 h-6 rounded-full flex items-center justify-center">T</Badge>
                              <Badge variant={pattern.wednesday ? "default" : "outline"} className="w-6 h-6 rounded-full flex items-center justify-center">W</Badge>
                              <Badge variant={pattern.thursday ? "default" : "outline"} className="w-6 h-6 rounded-full flex items-center justify-center">T</Badge>
                              <Badge variant={pattern.friday ? "default" : "outline"} className="w-6 h-6 rounded-full flex items-center justify-center">F</Badge>
                              <Badge variant={pattern.saturday ? "default" : "outline"} className="w-6 h-6 rounded-full flex items-center justify-center">S</Badge>
                              <Badge variant={pattern.sunday ? "default" : "outline"} className="w-6 h-6 rounded-full flex items-center justify-center">S</Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("font-normal", getLocationColor(pattern.location))}>
                              {getLocationName(pattern.location)}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {pattern.notes || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteRecurringPattern(pattern.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected {selectedPatterns.length} {tab === "one-time" ? "one-time entries" : "recurring patterns"}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteSelected}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Add Entry Modal */}
      <Dialog open={showAddEntryModal} onOpenChange={setShowAddEntryModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Calendar Entry</DialogTitle>
            <DialogDescription>
              Add a new one-time or recurring work pattern to your calendar.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="one-time" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="one-time">One-time Entry</TabsTrigger>
              <TabsTrigger value="recurring">Recurring Pattern</TabsTrigger>
            </TabsList>
            
            <TabsContent value="one-time" className="space-y-4 py-4">
              <OneTimeEntryForm onClose={() => setShowAddEntryModal(false)} />
            </TabsContent>
            
            <TabsContent value="recurring" className="space-y-4 py-4">
              <RecurringPatternForm onClose={() => setShowAddEntryModal(false)} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PreferencesSection() {
  const [autoFillHolidays, setAutoFillHolidays] = useState(true);
  const [showWeekends, setShowWeekends] = useState(true);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const { toast } = useToast();

  const handleSavePreferences = () => {
    // In a real application, we would save these to the server
    // For now, we'll just show a success toast
    toast({
      title: "Preferences saved",
      description: "Your preferences have been saved successfully.",
      variant: "default",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Customize your application experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Queensland Public Holidays</Label>
              <p className="text-sm text-muted-foreground">
                Automatically fill Queensland public holidays in your calendar
              </p>
            </div>
            <Switch 
              checked={autoFillHolidays}
              onCheckedChange={setAutoFillHolidays}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Show Weekends</Label>
              <p className="text-sm text-muted-foreground">
                Display weekend days in the calendar view
              </p>
            </div>
            <Switch 
              checked={showWeekends}
              onCheckedChange={setShowWeekends}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications for calendar updates and reminders
              </p>
            </div>
            <Switch 
              checked={enableNotifications}
              onCheckedChange={setEnableNotifications}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable dark theme for the application
              </p>
            </div>
            <Switch 
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t px-6 py-4">
        <Button 
          variant="default" 
          onClick={handleSavePreferences}
        >
          Save Preferences
        </Button>
      </CardFooter>
    </Card>
  );
}

// Form components for the Add Entry modal
function OneTimeEntryForm({ onClose }: { onClose: () => void }) {
  const { addWorkPattern } = useCalendar();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [location, setLocation] = useState<string>("office");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Please select a date for the entry",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addWorkPattern({
        date: selectedDate,
        location: location as any,
        notes: notes || null
      });
      
      toast({
        title: "Success",
        description: "Work pattern added successfully",
        variant: "default",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add work pattern",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <div className="border rounded-md p-2">
          <CalendarPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="mx-auto"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger>
            <SelectValue placeholder="Select a location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="office">Office</SelectItem>
            <SelectItem value="home">Home</SelectItem>
            <SelectItem value="annual_leave">Annual Leave</SelectItem>
            <SelectItem value="personal_leave">Personal Leave</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input 
          id="notes" 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
          placeholder="Add any additional information" 
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Add Entry"}
        </Button>
      </div>
    </form>
  );
}

function RecurringPatternForm({ onClose }: { onClose: () => void }) {
  const { addRecurringPattern } = useCalendar();
  const { toast } = useToast();
  const [location, setLocation] = useState<string>("office");
  const [notes, setNotes] = useState<string>("");
  const [daysOfWeek, setDaysOfWeek] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDayToggle = (day: keyof typeof daysOfWeek) => {
    setDaysOfWeek(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!Object.values(daysOfWeek).some(Boolean)) {
      toast({
        title: "Error",
        description: "Please select at least one day of the week",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addRecurringPattern({
        location: location as any,
        notes: notes || null,
        monday: daysOfWeek.monday,
        tuesday: daysOfWeek.tuesday,
        wednesday: daysOfWeek.wednesday,
        thursday: daysOfWeek.thursday,
        friday: daysOfWeek.friday,
        saturday: daysOfWeek.saturday,
        sunday: daysOfWeek.sunday,
      });
      
      toast({
        title: "Success",
        description: "Recurring pattern added successfully",
        variant: "default",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add recurring pattern",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Days of the Week</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={daysOfWeek.monday ? "default" : "outline"}
            className="flex-1 min-w-[3rem]"
            onClick={() => handleDayToggle("monday")}
          >
            Mon
          </Button>
          <Button
            type="button"
            variant={daysOfWeek.tuesday ? "default" : "outline"}
            className="flex-1 min-w-[3rem]"
            onClick={() => handleDayToggle("tuesday")}
          >
            Tue
          </Button>
          <Button
            type="button"
            variant={daysOfWeek.wednesday ? "default" : "outline"}
            className="flex-1 min-w-[3rem]"
            onClick={() => handleDayToggle("wednesday")}
          >
            Wed
          </Button>
          <Button
            type="button"
            variant={daysOfWeek.thursday ? "default" : "outline"}
            className="flex-1 min-w-[3rem]"
            onClick={() => handleDayToggle("thursday")}
          >
            Thu
          </Button>
          <Button
            type="button"
            variant={daysOfWeek.friday ? "default" : "outline"}
            className="flex-1 min-w-[3rem]"
            onClick={() => handleDayToggle("friday")}
          >
            Fri
          </Button>
          <Button
            type="button"
            variant={daysOfWeek.saturday ? "default" : "outline"}
            className="flex-1 min-w-[3rem]"
            onClick={() => handleDayToggle("saturday")}
          >
            Sat
          </Button>
          <Button
            type="button"
            variant={daysOfWeek.sunday ? "default" : "outline"}
            className="flex-1 min-w-[3rem]"
            onClick={() => handleDayToggle("sunday")}
          >
            Sun
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger>
            <SelectValue placeholder="Select a location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="office">Office</SelectItem>
            <SelectItem value="home">Home</SelectItem>
            <SelectItem value="annual_leave">Annual Leave</SelectItem>
            <SelectItem value="personal_leave">Personal Leave</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input 
          id="notes" 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
          placeholder="Add any additional information" 
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Add Pattern"}
        </Button>
      </div>
    </form>
  );
}