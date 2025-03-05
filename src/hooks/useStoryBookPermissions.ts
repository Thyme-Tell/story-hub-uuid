
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

type StoryBookRole = Database["public"]["Enums"]["storybook_role"];

interface StoryBookPermissions {
  isOwner: boolean;
  canEdit: boolean;
  canAddStories: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function useStoryBookPermissions(storyBookId: string): StoryBookPermissions {
  const { profileId, isAuthenticated } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["storybook-permissions", storyBookId, profileId],
    queryFn: async () => {
      if (!isAuthenticated || !profileId) {
        return null;
      }

      try {
        // Use the security definer function to avoid recursion
        const { data: roleData, error: roleError } = await supabase.rpc(
          'get_storybook_member_role',
          { 
            _storybook_id: storyBookId,
            _profile_id: profileId 
          }
        );

        if (roleError) {
          console.error("Error fetching member role:", roleError);
          throw roleError;
        }

        return roleData as StoryBookRole | null;
      } catch (err) {
        console.error("Failed to fetch permissions:", err);
        throw err;
      }
    },
    retry: 1,
    enabled: !!isAuthenticated && !!profileId && !!storyBookId,
  });

  return {
    isOwner: data === "owner",
    canEdit: data === "owner" || data === "contributor",
    canAddStories: data === "owner" || data === "contributor",
    isLoading,
    error: error as Error | null,
  };
}
