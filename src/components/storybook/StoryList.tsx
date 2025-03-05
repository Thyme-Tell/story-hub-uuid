import { useStoryBookPermissions } from "@/hooks/useStoryBookPermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddStoryModal } from "./AddStoryModal";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StoryListProps {
  storyBookId: string;
}

export function StoryList({ storyBookId }: StoryListProps) {
  const { canAddStories, isLoading: permissionsLoading } = useStoryBookPermissions(storyBookId);
  const { toast } = useToast();

  const { data: stories, isLoading: storiesLoading, refetch } = useQuery({
    queryKey: ["storybook-stories", storyBookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("storybook_stories")
        .select(`
          id,
          story:stories (
            id,
            title,
            content,
            created_at
          )
        `)
        .eq("storybook_id", storyBookId);

      if (error) throw error;
      return data;
    },
  });

  if (permissionsLoading || storiesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Stories</h2>
        {canAddStories && (
          <AddStoryModal storyBookId={storyBookId} onSuccess={refetch} />
        )}
      </div>

      <div className="space-y-4">
        {stories?.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No stories have been added to this storybook yet.
          </p>
        ) : (
          stories?.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 space-y-2 hover:bg-accent transition-colors"
            >
              <h3 className="font-medium">
                {item.story?.title || "Untitled Story"}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.story?.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}