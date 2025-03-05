
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { StoryMediaGallery } from "./StoryMediaGallery";

interface StoryFeedProps {
  storyBookId: string;
  sortOrder: string;
}

export function StoryFeed({ storyBookId, sortOrder }: StoryFeedProps) {
  const { profileId } = useAuth();

  const { data: stories, isLoading, error } = useQuery({
    queryKey: ["storybook-stories", storyBookId, sortOrder],
    queryFn: async () => {
      let query = supabase
        .from("storybook_stories")
        .select(`
          id,
          added_at,
          added_by,
          profiles!storybook_stories_added_by_fkey (
            first_name,
            last_name
          ),
          story:stories (
            id,
            title,
            content,
            created_at
          )
        `)
        .eq("storybook_id", storyBookId);

      // Apply sorting
      if (sortOrder === "newest") {
        query = query.order("added_at", { ascending: false });
      } else if (sortOrder === "oldest") {
        query = query.order("added_at", { ascending: true });
      } else if (sortOrder === "alphabetical") {
        // This sorts by story title alphabetically
        query = query.order("story(title)", { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  // Function to fetch media for each story
  const { data: storiesWithMedia, isLoading: isLoadingMedia } = useQuery({
    queryKey: ["storybook-stories-media", stories],
    queryFn: async () => {
      if (!stories || stories.length === 0) return [];

      const storiesWithMediaPromises = stories.map(async (storyItem) => {
        if (!storyItem.story) return storyItem;

        const { data: media, error } = await supabase
          .from("story_media")
          .select("*")
          .eq("story_id", storyItem.story.id);

        if (error) {
          console.error("Error fetching media:", error);
          return { ...storyItem, media: [] };
        }

        return { ...storyItem, media: media || [] };
      });

      return Promise.all(storiesWithMediaPromises);
    },
    enabled: !!stories && stories.length > 0,
  });

  if (isLoading || isLoadingMedia) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#A33D29]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-6">
        <p className="text-red-600">Error loading stories: {error.message}</p>
      </div>
    );
  }

  if (!storiesWithMedia || storiesWithMedia.length === 0) {
    return (
      <div className="bg-white/80 rounded-lg p-8 text-center">
        <p className="text-gray-500">No stories have been added to this storybook yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {storiesWithMedia.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4">
              {/* Author and date */}
              <div className="flex justify-between items-center mb-3">
                <div className="font-semibold">
                  {item.profiles?.first_name} {item.profiles?.last_name}
                </div>
                <div className="text-sm text-gray-500">
                  {item.story?.created_at && format(new Date(item.story.created_at), "MMMM yyyy")}
                </div>
              </div>
              
              {/* Story title and content */}
              <h3 className="text-3xl font-bold mb-3">
                {item.story?.title || "Untitled"}
              </h3>
              <p className="text-gray-700 mb-4">
                {item.story?.content}
              </p>
              
              {/* Media gallery if available */}
              {item.media && item.media.length > 0 && (
                <StoryMediaGallery media={item.media} />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
