import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users } from "lucide-react";
import { TeamCalendar } from "@/components/team/team-calendar";

// Removes password and other sensitive fields from User type
type SafeUser = Omit<User, "password">;

export function TeamView() {
  const [activeTab, setActiveTab] = useState<string>("team");
  
  // Fetch all users
  const { data: teamUsers = [], isLoading } = useQuery<SafeUser[]>({
    queryKey: ["/api/team"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Determine user initials for avatar fallback
  const getUserInitials = (displayName: string): string => {
    return displayName
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Team</h1>
            <p className="text-muted-foreground">View and coordinate with your team members</p>
          </div>
          <TabsList>
            <TabsTrigger value="team">Team Members</TabsTrigger>
            <TabsTrigger value="calendar">Team Calendar</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="team" className="mt-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : teamUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamUsers.map((user) => (
                <Card key={user.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} />
                        <AvatarFallback>{getUserInitials(user.displayName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">{user.displayName}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mt-2">
                      {user.role === "admin" && (
                        <Badge variant="outline" className="bg-primary/10">Admin</Badge>
                      )}
                      <Badge variant="outline">Member</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No team members found</h3>
              <p className="text-muted-foreground">Invite colleagues to join your team.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Team Calendar View</CardTitle>
              <CardDescription>
                View everyone's work patterns in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamCalendar />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}