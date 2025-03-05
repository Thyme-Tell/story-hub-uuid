
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

      // Use a direct query instead of the function call that was causing recursion
      const { data: memberData, error: memberError } = await supabase
        .from("storybook_members")
        .select("role")
        .eq("storybook_id", storyBookId)
        .eq("profile_id", userData.user.id)
        .single();

      if (memberError && memberError.code !== 'PGRST116') {
        console.error("Error fetching member role:", memberError);
        throw memberError;
      }

      return memberData?.role as StoryBookRole | null;
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
