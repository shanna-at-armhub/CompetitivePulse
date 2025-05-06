import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Users, Settings, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function NavHeader() {
  const [location] = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header className="bg-white dark:bg-gray-900 border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-primary flex items-center">
          <Calendar className="mr-2 h-6 w-6" />
          WorkPatterns
        </Link>
        
        <nav className="flex items-center space-x-1">
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
        </nav>
      </div>
    </header>
  );
}