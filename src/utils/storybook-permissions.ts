import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type StoryBookRole = Database["public"]["Enums"]["storybook_role"];

export async function isStoryBookOwner(userId: string, storyBookId: string): Promise<boolean> {
  const { data } = await supabase
    .from("storybook_members")
    .select("role")
    .eq("storybook_id", storyBookId)
    .eq("profile_id", userId)
    .single();

  return data?.role === "owner";
}

export async function canEditStoryBook(userId: string, storyBookId: string): Promise<boolean> {
  const { data } = await supabase
    .from("storybook_members")
    .select("role")
    .eq("storybook_id", storyBookId)
    .eq("profile_id", userId)
    .single();

  return data?.role === "owner" || data?.role === "contributor";
}

export async function canAddStories(userId: string, storyBookId: string): Promise<boolean> {
  const { data } = await supabase
    .from("storybook_members")
    .select("role")
    .eq("storybook_id", storyBookId)
    .eq("profile_id", userId)
    .single();

  return data?.role === "owner" || data?.role === "contributor";
}