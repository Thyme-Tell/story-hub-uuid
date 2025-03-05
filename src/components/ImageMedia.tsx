import { Button } from "@/components/ui/button";
import { Crop } from "lucide-react";
import MediaCaption from "./MediaCaption";
import { supabase } from "@/integrations/supabase/client";

interface ImageMediaProps {
  media: {
    id: string;
    file_path: string;
    file_name: string;
    caption: string | null;
  };
  onImageClick: (url: string) => void;
  onStartCrop: (url: string, mediaId: string) => void;
  onCaptionUpdate: (mediaId: string, caption: string) => void;
}

const ImageMedia = ({ media, onImageClick, onStartCrop, onCaptionUpdate }: ImageMediaProps) => {
  const { data } = supabase.storage
    .from("story-media")
    .getPublicUrl(media.file_path);

  return (
    <div className="space-y-2">
      <div className="relative">
        <img
          src={data.publicUrl}
          alt={media.file_name}
          className="rounded-lg object-cover aspect-square w-full cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => onImageClick(data.publicUrl)}
          loading="lazy"
        />
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-2 right-2"
          onClick={() => onStartCrop(data.publicUrl, media.id)}
        >
          <Crop className="h-4 w-4" />
        </Button>
      </div>
      <MediaCaption
        mediaId={media.id}
        caption={media.caption}
        onUpdate={onCaptionUpdate}
      />
    </div>
  );
};

export default ImageMedia;