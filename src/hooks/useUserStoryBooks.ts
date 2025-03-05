
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoryBook } from "@/types/supabase";

export function useUserStoryBooks(profileId: string | null) {
  const {
    data: storybooks,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["user-storybooks", profileId],
    queryFn: async () => {
      if (!profileId) {
        return [];
      }

      // Call the dedicated database function to avoid recursion
      const { data, error } = await supabase.rpc(
        'get_user_storybooks' as any,
        { _profile_id: profileId }
      );

      if (error) {
        console.error("Error fetching storybooks:", error);
        throw error;
      }

      return data as StoryBook[];
    },
    enabled: !!profileId,
    retry: 1,
  });

  return {
    storybooks: storybooks || [],
    isLoading,
    error: error as Error | null,
    refetch
  };
}
