import { useAuth } from "@/hooks/use-auth";
import { 
  Calendar,
  Users,
  Settings,
  UserCircle,
  LogOut
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const isMobile = useMobile();
  const [location] = useLocation();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const closeSidebarOnMobile = () => {
    if (isMobile) {
      onClose();
    }
  };
  
  // Extract user initials for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const navigationItems = [
    {
      name: "Calendar",
      href: "/",
      icon: Calendar,
      current: location === "/"
    },
    {
      name: "Team",
      href: "/team",
      icon: Users,
      current: location === "/team"
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      current: location === "/settings"
    }
  ];
  
  // Only show admin link for admin users
  if (user?.role === "admin") {
    navigationItems.push({
      name: "Admin",
      href: "/admin",
      icon: UserCircle,
      current: location === "/admin"
    });
  }
  
  const sidebarClasses = cn(
    "fixed inset-y-0 z-20 flex-shrink-0 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out",
    isMobile && !isOpen ? "-translate-x-full" : "translate-x-0",
  );

  return (
    <aside className={sidebarClasses}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary">WorkPatterns</h1>
        </div>
        
        {/* User Profile */}
        {user && (
          <div className="flex items-center p-4 border-b border-gray-200">
            <Avatar>
              <AvatarImage src={user.avatarUrl || ""} alt={user.displayName} />
              <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium">{user.displayName}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => (
            <Link key={item.name} href={item.href} onClick={closeSidebarOnMobile}>
              <a className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                item.current 
                  ? "bg-gray-100 text-primary"
                  : "text-gray-700 hover:bg-gray-100 hover:text-primary"
              )}>
                <item.icon className="h-5 w-5 mr-2" />
                {item.name}
              </a>
            </Link>
          ))}
        </nav>
        
        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <Button 
            variant="ghost" 
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-red-500"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
