import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useStoryMedia = (storyId: string | undefined) => {
  return useQuery({
    queryKey: ["story-media", storyId],
    queryFn: async () => {
      if (!storyId) {
        return [];
      }

      const { data, error } = await supabase
        .from("story_media")
        .select("*")
        .eq("story_id", storyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!storyId, // Only run the query if storyId exists
  });
};