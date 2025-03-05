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

      const { data: memberData } = await supabase
        .from("storybook_members")
        .select("role")
        .eq("storybook_id", storyBookId)
        .eq("profile_id", userData.user.id)
        .single();

      return memberData?.role as StoryBookRole | null;
    },
  });

  return {
    isOwner: data === "owner",
    canEdit: data === "owner" || data === "contributor",
    canAddStories: data === "owner" || data === "contributor",
    isLoading,
    error: error as Error | null,
  };
}