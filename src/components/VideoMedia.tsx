import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import MediaCaption from "./MediaCaption";
import { supabase } from "@/integrations/supabase/client";

interface VideoMediaProps {
  media: {
    id: string;
    file_path: string;
    content_type: string;
    caption: string | null;
  };
  onCaptionUpdate: (mediaId: string, caption: string) => void;
}

const VideoMedia = ({ media, onCaptionUpdate }: VideoMediaProps) => {
  const { data } = supabase.storage
    .from("story-media")
    .getPublicUrl(media.file_path);

  const videoOptions = {
    controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
    settings: ['quality', 'speed'],
    quality: {
      default: 720,
      options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240]
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative aspect-square rounded-lg overflow-hidden">
        <Plyr
          source={{
            type: "video",
            sources: [
              {
                src: data.publicUrl,
                type: media.content_type,
              },
            ],
          }}
          options={videoOptions}
        />
      </div>
      <MediaCaption
        mediaId={media.id}
        caption={media.caption}
        onUpdate={onCaptionUpdate}
      />
    </div>
  );
};

export default VideoMedia;