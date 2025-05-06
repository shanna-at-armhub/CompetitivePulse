import { Header } from "@/components/ui/header";
import { CalendarView } from "@/components/calendar/calendar-view";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user } = useAuth();
  
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50 p-[10px]">
      {/* Main content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden rounded-lg shadow-sm">
        <Header />
        <CalendarView />
      </div>
    </div>
  );
}
