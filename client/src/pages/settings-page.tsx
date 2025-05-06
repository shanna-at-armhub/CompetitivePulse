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
