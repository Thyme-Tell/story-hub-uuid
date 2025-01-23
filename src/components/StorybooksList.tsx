import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import CollaboratorsList from "./CollaboratorsList";

interface StorybooksListProps {
  profileId: string;
}

const StorybooksList = ({ profileId }: StorybooksListProps) => {
  const { toast } = useToast();
  
  const { data: storybooks, isLoading, error } = useQuery({
    queryKey: ["storybooks", profileId],
    queryFn: async () => {
      console.log("Fetching storybooks for profile:", profileId);
      
      // First, fetch the storybooks
      const { data: storybooksData, error: storybooksError } = await supabase
        .from("storybooks")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });

      if (storybooksError) {
        console.error("Error fetching storybooks:", storybooksError);
        throw storybooksError;
      }

      console.log("Fetched storybooks:", storybooksData);

      // Then, for each storybook, fetch the story count
      const storybooksWithCounts = await Promise.all(
        storybooksData.map(async (storybook) => {
          const { count, error: countError } = await supabase
            .from("stories_storybooks")
            .select("*", { count: 'exact', head: true })
            .eq("storybook_id", storybook.id);

          if (countError) {
            console.error("Error fetching story count:", countError);
            return { ...storybook, storyCount: 0 };
          }

          return { ...storybook, storyCount: count || 0 };
        })
      );

      console.log("Storybooks with counts:", storybooksWithCounts);
      return storybooksWithCounts;
    },
  });

  if (error) {
    console.error("Query error:", error);
    return <p className="text-red-500">Error loading storybooks. Please try again.</p>;
  }

  if (isLoading) {
    return <p className="text-muted-foreground">Loading storybooks...</p>;
  }

  if (!storybooks?.length) {
    return <p className="text-muted-foreground">No storybooks yet.</p>;
  }

  return (
    <div className="space-y-8">
      {storybooks.map((storybook) => (
        <div key={storybook.id} className="space-y-4">
          <Link 
            to={`/storybook/${storybook.id}`}
            className="block transition-all hover:scale-[1.02]"
          >
            <div className="p-6 rounded-lg border bg-card text-card-foreground hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg">{storybook.title}</h3>
              {storybook.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {storybook.description}
                </p>
              )}
              
              <p className="text-sm text-muted-foreground mt-4">
                {storybook.storyCount} {storybook.storyCount === 1 ? 'story' : 'stories'}
              </p>
            </div>
          </Link>

          <div className="px-6">
            <h4 className="text-sm font-medium mb-2">Collaborators</h4>
            <CollaboratorsList 
              storybookId={storybook.id} 
              isOwner={storybook.profile_id === profileId}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default StorybooksList;