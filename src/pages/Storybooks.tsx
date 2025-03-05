import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Book, BookOpen, Share } from "lucide-react";

interface Storybook {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  profile_id: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

const Storybooks = () => {
  const { data: storybooks, isLoading } = useQuery({
    queryKey: ["storybooks-all"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("storybooks")
        .select(`
          *,
          profiles (
            first_name,
            last_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { data, userId: userData?.user?.id };
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Loading storybooks...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full flex justify-between items-center py-4 px-4 bg-white/80">
        <img 
          src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/narra-logo.svg" 
          alt="Narra Logo"
          className="h-11"
        />
      </div>
      
      <div className="p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">My Storybooks</h1>
            <Button asChild>
              <Link to="/profile">Back to Profile</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {storybooks?.data?.map((storybook) => (
              <div
                key={storybook.id}
                className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {storybook.profile_id === storybooks.userId ? (
                      <Book className="h-5 w-5 text-primary" />
                    ) : (
                      <Share className="h-5 w-5 text-muted-foreground" />
                    )}
                    <h3 className="font-semibold">{storybook.title}</h3>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/profile/${storybook.profile_id}`}>
                      <BookOpen className="h-4 w-4" />
                      <span className="sr-only">View storybook</span>
                    </Link>
                  </Button>
                </div>
                
                {storybook.description && (
                  <p className="text-sm text-muted-foreground">
                    {storybook.description}
                  </p>
                )}
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Created by {storybook.profiles.first_name} {storybook.profiles.last_name}</p>
                  <p>Created {new Date(storybook.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Storybooks;