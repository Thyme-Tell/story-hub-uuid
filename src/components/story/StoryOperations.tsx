import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface StoryOperations {
  storyId: string;
  onUpdate: () => void;
}

export const useStoryOperations = ({ storyId, onUpdate }: StoryOperations) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSave = async (title: string, content: string, date: Date) => {
    const { error } = await supabase
      .from("stories")
      .update({
        title,
        content,
        created_at: date.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", storyId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update story",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Story updated successfully",
    });
    
    onUpdate();
    return true;
  };

  const handleDelete = async () => {
    const { data: storyData, error: storyError } = await supabase
      .from("stories")
      .select("*, profiles(id)")
      .eq("id", storyId)
      .single();

    if (storyError) {
      toast({
        title: "Error",
        description: "Failed to fetch story details",
        variant: "destructive",
      });
      return;
    }

    const { error: insertError } = await supabase
      .from("deleted_stories")
      .insert({
        original_id: storyId,
        profile_id: storyData.profile_id,
        content: storyData.content,
        title: storyData.title,
        created_at: storyData.created_at,
        updated_at: storyData.updated_at,
      });

    if (insertError) {
      toast({
        title: "Error",
        description: "Failed to archive story",
        variant: "destructive",
      });
      return;
    }

    const { error: deleteError } = await supabase
      .from("stories")
      .delete()
      .eq("id", storyId);

    if (deleteError) {
      toast({
        title: "Error",
        description: "Failed to delete story",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Story deleted successfully",
    });
    
    onUpdate();
  };

  const handleShare = async (story: { share_token: string | null; title: string | null }) => {
    if (!story.share_token) {
      const { data, error } = await supabase
        .from("stories")
        .update({ share_token: crypto.randomUUID() })
        .eq("id", storyId)
        .select('share_token')
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to generate share link",
          variant: "destructive",
        });
        return false;
      }
      
      onUpdate();
    }

    const shareUrl = `${window.location.origin}/stories/${story.share_token}`;

    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title: story.title || "My Story",
          text: "Check out my story on Narra",
          url: shareUrl,
        });
        toast({
          title: "Success",
          description: "Story shared successfully",
        });
        return true;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          return false;
        }
      }
    }
    
    return false;
  };

  return {
    handleSave,
    handleDelete,
    handleShare,
  };
};