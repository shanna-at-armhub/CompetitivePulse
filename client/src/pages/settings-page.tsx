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
    <div className="h-screen p-[10px] bg-gray-50">
      <div className="h-full rounded-lg shadow-sm overflow-auto bg-white">
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
      </div>
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
              Add a new calendar entry to your work patterns
            </DialogDescription>
          </DialogHeader>
          
          {/* Dialog content for adding entry */}
          <div className="space-y-4 py-4">
            <p>Dialog content will go here...</p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEntryModal(false)}>
              Cancel
            </Button>
            <Button>
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog 
        open={isConfirmingDelete} 
        onOpenChange={setIsConfirmingDelete}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Patterns</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedPatterns.length} selected patterns? This action cannot be undone.
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
      
      <div className="flex flex-col space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Calendar Entries</CardTitle>
              <CardDescription>Manage your work patterns</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleRefreshPublicHolidays}
                disabled={refreshPublicHolidays}
                className="flex items-center gap-1"
              >
                {refreshPublicHolidays ? (
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                <span>Refresh Holidays</span>
              </Button>
              <Button onClick={() => setShowAddEntryModal(true)}>
                Add Entry
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(value) => setTab(value as "one-time" | "recurring")}>
              <TabsList className="mb-4">
                <TabsTrigger value="one-time">
                  One-time Patterns
                </TabsTrigger>
                <TabsTrigger value="recurring">
                  Recurring Patterns
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="one-time">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={selectAll}
                              onChange={(e) => handleSelectAll(e.target.checked)}
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
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            Loading work patterns...
                          </TableCell>
                        </TableRow>
                      ) : workPatterns.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No work patterns found. Click "Add Entry" to create one.
                          </TableCell>
                        </TableRow>
                      ) : (
                        workPatterns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((pattern) => (
                          <TableRow key={pattern.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={selectedPatterns.includes(pattern.id)}
                                onChange={(e) => handleSelectPattern(pattern.id, e.target.checked)}
                              />
                            </TableCell>
                            <TableCell>
                              {format(new Date(pattern.date), "EEEE, MMMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              <Badge className={cn("border", getLocationColor(pattern.location))}>
                                {getLocationName(pattern.location)}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {pattern.notes || "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive"
                                onClick={() => {
                                  setSelectedPatterns([pattern.id]);
                                  setIsConfirmingDelete(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="recurring">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={selectAll}
                              onChange={(e) => handleSelectAll(e.target.checked)}
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
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            Loading recurring patterns...
                          </TableCell>
                        </TableRow>
                      ) : recurringPatterns.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No recurring patterns found. Click "Add Entry" to create one.
                          </TableCell>
                        </TableRow>
                      ) : (
                        recurringPatterns.map((pattern) => (
                          <TableRow key={pattern.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={selectedPatterns.includes(pattern.id)}
                                onChange={(e) => handleSelectPattern(pattern.id, e.target.checked)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                {pattern.monday && <Badge variant="outline" className="p-1 min-w-7 text-center">M</Badge>}
                                {pattern.tuesday && <Badge variant="outline" className="p-1 min-w-7 text-center">T</Badge>}
                                {pattern.wednesday && <Badge variant="outline" className="p-1 min-w-7 text-center">W</Badge>}
                                {pattern.thursday && <Badge variant="outline" className="p-1 min-w-7 text-center">T</Badge>}
                                {pattern.friday && <Badge variant="outline" className="p-1 min-w-7 text-center">F</Badge>}
                                {pattern.saturday && <Badge variant="outline" className="p-1 min-w-7 text-center">S</Badge>}
                                {pattern.sunday && <Badge variant="outline" className="p-1 min-w-7 text-center">S</Badge>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn("border", getLocationColor(pattern.location))}>
                                {getLocationName(pattern.location)}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {pattern.notes || "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive"
                                onClick={() => {
                                  setSelectedPatterns([pattern.id]);
                                  setIsConfirmingDelete(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
            
            {selectedPatterns.length > 0 && (
              <div className="flex justify-between items-center mt-4 p-2 bg-muted/30 rounded-md">
                <span className="text-sm">
                  {selectedPatterns.length} item{selectedPatterns.length !== 1 ? "s" : ""} selected
                </span>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setIsConfirmingDelete(true)}
                >
                  Delete Selected
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function PreferencesSection() {
  const [defaultLocation, setDefaultLocation] = useState("office");
  const [showNotifications, setShowNotifications] = useState(true);
  const [sendEmailReminders, setSendEmailReminders] = useState(false);
  const [defaultView, setDefaultView] = useState("month");
  const { toast } = useToast();
  
  const handleSavePreferences = () => {
    toast({
      title: "Preferences saved",
      description: "Your preferences have been updated successfully.",
      variant: "default",
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Customize your calendar experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Calendar Settings</h3>
            <Separator className="my-2" />
          </div>
          
          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="defaultView">Default Calendar View</Label>
              <Select 
                value={defaultView} 
                onValueChange={setDefaultView}
              >
                <SelectTrigger id="defaultView">
                  <SelectValue placeholder="Select default view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose which view to show when you first open the calendar
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="defaultLocation">Default Work Location</Label>
              <Select 
                value={defaultLocation} 
                onValueChange={setDefaultLocation}
              >
                <SelectTrigger id="defaultLocation">
                  <SelectValue placeholder="Select default location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose your default work location for new entries
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Notifications</h3>
            <Separator className="my-2" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="showNotifications">Browser Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications in your browser
                </p>
              </div>
              <Switch
                id="showNotifications"
                checked={showNotifications}
                onCheckedChange={setShowNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sendEmailReminders">Email Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Receive daily email reminders of your schedule
                </p>
              </div>
              <Switch
                id="sendEmailReminders"
                checked={sendEmailReminders}
                onCheckedChange={setSendEmailReminders}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t px-6 py-4">
        <Button onClick={handleSavePreferences}>
          Save Preferences
        </Button>
      </CardFooter>
    </Card>
  );
}
