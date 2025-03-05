import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AddStoryModalProps {
  storyBookId: string;
  onSuccess: () => void;
}

export const AddStoryModal = ({ storyBookId, onSuccess }: AddStoryModalProps) => {
  const { toast } = useToast();

  const { data: stories, isLoading } = useQuery({
    queryKey: ["available-stories", storyBookId],
    queryFn: async () => {
      // Get stories that aren't already in the storybook
      const { data: existingStoryIds } = await supabase
        .from("storybook_stories")
        .select("story_id")
        .eq("storybook_id", storyBookId);

      const storyIds = existingStoryIds?.map(s => s.story_id) || [];

      const { data, error } = await supabase
        .from("stories")
        .select("id, title, content, created_at")
        .not("id", "in", `(${storyIds.join(",")})`);

      if (error) throw error;
      return data;
    },
  });

  const handleAddStory = async (storyId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add stories",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("storybook_stories")
      .insert({
        storybook_id: storyBookId,
        story_id: storyId,
        added_by: user.id,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add story to storybook",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Story added to storybook",
    });
    onSuccess();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Story
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Story to Storybook</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <p className="text-muted-foreground">Loading stories...</p>
          ) : stories?.length === 0 ? (
            <p className="text-muted-foreground">No stories available to add</p>
          ) : (
            stories?.map((story) => (
              <div
                key={story.id}
                className="border rounded-lg p-4 space-y-2 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    {story.title || "Untitled Story"}
                  </h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddStory(story.id)}
                  >
                    Add
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {story.content}
                </p>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};