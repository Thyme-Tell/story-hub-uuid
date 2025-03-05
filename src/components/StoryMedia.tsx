import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import MediaCarousel from "./media/MediaCarousel";
import { StoryMediaItem } from "@/types/media";

interface StoryMediaProps {
  storyId: string;
}

const StoryMedia = ({ storyId }: StoryMediaProps) => {
  const { toast } = useToast();

  const { data: mediaItems = [], refetch } = useQuery({
    queryKey: ["story-media", storyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("story_media")
        .select("*")
        .eq("story_id", storyId)
        .order("created_at", { ascending: true }); // Changed to ascending order

      if (error) {
        console.error("Error fetching media:", error);
        toast({
          title: "Error",
          description: "Failed to load media",
          variant: "destructive",
        });
        return [];
      }

      return data as StoryMediaItem[];
    },
  });

  const handleCaptionUpdate = async (mediaId: string, caption: string) => {
    const { error } = await supabase
      .from("story_media")
      .update({ caption })
      .eq("id", mediaId);

    if (error) {
      console.error("Error updating caption:", error);
      toast({
        title: "Error",
        description: "Failed to update caption",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Caption updated successfully",
    });
    refetch();
  };

  return (
    <MediaCarousel
      mediaItems={mediaItems}
      onCaptionUpdate={handleCaptionUpdate}
      onDelete={refetch}
    />
  );
};

export default StoryMedia;