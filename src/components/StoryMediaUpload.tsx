import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";

interface StoryMediaUploadProps {
  storyId: string;
  onUploadComplete?: () => void;
}

const StoryMediaUpload = ({ storyId, onUploadComplete }: StoryMediaUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('story-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create media record in database
      const { error: dbError } = await supabase
        .from('story_media')
        .insert({
          story_id: storyId,
          file_path: filePath,
          file_name: file.name,
          content_type: file.type,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Media uploaded successfully",
      });

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload media",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-start mb-5 mt-[20px]">
      <input
        type="file"
        id="media"
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,video/*,audio/*"
        disabled={uploading}
      />
      <label htmlFor="media">
        <Button
          variant="ghost"
          className="cursor-pointer text-[#A33D29] hover:text-[#A33D29]/90 hover:bg-transparent p-0"
          disabled={uploading}
          asChild
        >
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {uploading ? "Uploading..." : "Add Photos and Videos"}
          </span>
        </Button>
      </label>
    </div>
  );
};

export default StoryMediaUpload;