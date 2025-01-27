import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StoryMedia from "./StoryMedia";

interface SharedStoryProps {
  shareToken: string;
}

const SharedStory = ({ shareToken }: SharedStoryProps) => {
  const { data: story, isLoading } = useQuery({
    queryKey: ["shared-story", shareToken],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("*, profiles(first_name, last_name)")
        .eq("share_token", shareToken)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Loading story...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Story not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm space-y-4 p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {new Date(story.created_at).toLocaleDateString()}
            </p>
            {story.title && (
              <h1 className="text-2xl font-semibold">{story.title}</h1>
            )}
            <p className="text-sm text-muted-foreground">
              By {story.profiles.first_name} {story.profiles.last_name}
            </p>
          </div>
          <p className="whitespace-pre-wrap">{story.content}</p>
          <StoryMedia storyId={story.id} />
        </div>
      </div>
    </div>
  );
};

export default SharedStory;