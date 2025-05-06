import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { TeamView } from "@/components/team/team-view";
import { Loader2 } from "lucide-react";

export default function TeamPage() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ); // Will redirect due to the useEffect above
  }
  
  return (
    <div className="h-screen p-[10px] bg-gray-50">
      <div className="h-full rounded-lg shadow-sm overflow-auto bg-white">
        <TeamView />
      </div>
    </div>
  );
}