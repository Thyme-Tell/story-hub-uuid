import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import StoryContent from "./StoryContent";

const SharedStory = () => {
  const { shareToken } = useParams();
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStory = async () => {
      const { data, error } = await supabase
        .from("stories")
        .select(`
          *,
          profile:profiles(first_name, last_name)
        `)
        .eq("share_token", shareToken)
        .single();

      if (error) {
        setError("Story not found or no longer available");
      } else {
        setStory(data);
      }
      setLoading(false);
    };

    fetchStory();
  }, [shareToken]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !story) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {story.profile && (
        <p className="text-muted-foreground mb-4">
          Shared by {story.profile.first_name} {story.profile.last_name}
        </p>
      )}
      <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
        <p className="text-sm text-muted-foreground mb-4">
          {new Date(story.created_at).toLocaleDateString()}
        </p>
        <StoryContent
          title={story.title}
          content={story.content}
          storyId={story.id}
          onUpdate={() => {}}
        />
      </div>
    </div>
  );
};

export default SharedStory;