import { useState } from "react";
import { ChevronLeft, ChevronRight, Users, Settings, Home, Bell, Calendar, UserCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { useCalendar } from "@/hooks/use-calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { currentDate, setCurrentDate, view, setView, mode, setMode } = useCalendar();
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  // Get user initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Navigation
  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  return (
    <header className="relative z-10 flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
      {/* Logo and main navigation */}
      <div className="flex items-center space-x-2">
        <Link href="/" className="text-xl font-bold text-primary flex items-center mr-6">
          <Calendar className="mr-2 h-6 w-6" />
          <span className="hidden sm:inline">WorkPatterns</span>
        </Link>
        
        <div className="flex items-center space-x-1">
          <Button
            variant={location === "/" ? "default" : "ghost"}
            size="sm"
            asChild
          >
            <Link href="/" className="flex items-center">
              <Home className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Calendar</span>
            </Link>
          </Button>
          
          <Button
            variant={location === "/team" ? "default" : "ghost"}
            size="sm"
            asChild
          >
            <Link href="/team" className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Team</span>
            </Link>
          </Button>
          
          <Button
            variant={location === "/settings" ? "default" : "ghost"}
            size="sm"
            asChild
          >
            <Link href="/settings" className="flex items-center">
              <Settings className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </Button>
          
          {user?.role === "admin" && (
            <Button
              variant={location === "/admin" ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link href="/admin" className="flex items-center">
                <UserCircle className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      {/* Calendar controls */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </Button>
          <span className="text-sm font-medium hidden sm:inline">{format(currentDate, "MMMM yyyy")}</span>
          <span className="text-sm font-medium sm:hidden">{format(currentDate, "MMM yy")}</span>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
        
        <div className="hidden sm:flex border rounded-md overflow-hidden divide-x divide-gray-200">
          <Button
            variant="ghost"
            className={cn(
              "px-3 py-1 text-sm font-medium rounded-none",
              view === "month" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            )}
            onClick={() => setView("month")}
          >
            Month
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "px-3 py-1 text-sm font-medium rounded-none",
              view === "week" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            )}
            onClick={() => setView("week")}
          >
            Week
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "px-3 py-1 text-sm font-medium rounded-none",
              view === "day" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            )}
            onClick={() => setView("day")}
          >
            Day
          </Button>
        </div>
      </div>
      
      {/* User controls */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" className="text-sm text-gray-700" onClick={handleToday}>
          <Calendar className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Today</span>
        </Button>
        
        <Select value={mode} onValueChange={(value) => setMode(value as "personal" | "team")}>
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue placeholder="Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="team">Team</SelectItem>
          </SelectContent>
        </Select>
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={user.avatarUrl || ""} alt={user.displayName} />
                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user.displayName}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="text-red-600 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
