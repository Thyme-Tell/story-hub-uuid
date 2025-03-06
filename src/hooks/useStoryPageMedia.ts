
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoryMediaItem } from "@/types/media";

export const useStoryPageMedia = (storyId: string) => {
  const { data: mediaItems = [], isLoading: isMediaLoading } = useQuery({
    queryKey: ["story-media", storyId],
    queryFn: async () => {
      if (!storyId) return [];
      
      const { data, error } = await supabase
        .from("story_media")
        .select("*")
        .eq("story_id", storyId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching media:", error);
        return [];
      }

      // Transform the data to include full URLs
      return (data || []).map((item: any) => {
        // Create a full public URL for the media item
        const publicUrl = supabase.storage
          .from("story-media")
          .getPublicUrl(item.file_path).data.publicUrl;
          
        return {
          ...item,
          file_path: publicUrl // Replace with the full URL
        };
      });
    },
    enabled: !!storyId,
  });

  return { mediaItems, isLoading: isMediaLoading };
};
