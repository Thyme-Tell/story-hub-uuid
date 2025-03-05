
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type StoryBookRole = Database["public"]["Enums"]["storybook_role"];

interface StoryBookPermissions {
  isOwner: boolean;
  canEdit: boolean;
  canAddStories: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function useStoryBookPermissions(storyBookId: string): StoryBookPermissions {
  const { data, isLoading, error } = useQuery({
    queryKey: ["storybook-permissions", storyBookId],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      // Use the security definer function we created to avoid recursion
      const { data: roleData, error: roleError } = await supabase.rpc(
        'get_storybook_member_role',
        { 
          _storybook_id: storyBookId,
          _profile_id: userData.user.id 
        }
      );

      if (roleError) {
        console.error("Error fetching member role:", roleError);
        throw roleError;
      }

      return roleData as StoryBookRole | null;
    },
    retry: 1,
  });

  return {
    isOwner: data === "owner",
    canEdit: data === "owner" || data === "contributor",
    canAddStories: data === "owner" || data === "contributor",
    isLoading,
    error: error as Error | null,
  };
}
