
import { useState } from "react";
import { StoryMediaItem } from "@/types/media";
import { supabase } from "@/integrations/supabase/client";

interface StoryMediaGalleryProps {
  media: StoryMediaItem[];
}

export function StoryMediaGallery({ media }: StoryMediaGalleryProps) {
  const [expandedMedia, setExpandedMedia] = useState<StoryMediaItem | null>(null);
  
  // Filter media by type
  const images = media.filter(item => item.content_type.startsWith('image/'));
  const videos = media.filter(item => item.content_type.startsWith('video/'));
  const audio = media.filter(item => item.content_type.startsWith('audio/'));
  
  // If there's no media, don't render anything
  if (media.length === 0) return null;
  
  // Get public URL for media file
  const getMediaUrl = (filePath: string) => {
    const { data } = supabase.storage.from('media').getPublicUrl(filePath);
    return data.publicUrl;
  };
  
  // Render different layouts based on the number of images
  const renderImageGrid = () => {
    if (images.length === 0) return null;
    
    if (images.length === 1) {
      return (
        <div 
          className="w-full h-64 rounded-lg overflow-hidden cursor-pointer"
          onClick={() => setExpandedMedia(images[0])}
        >
          <img 
            src={getMediaUrl(images[0].file_path)} 
            alt={images[0].caption || "Media"}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    
    if (images.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-2 h-64">
          {images.map((image, index) => (
            <div 
              key={image.id}
              className="rounded-lg overflow-hidden cursor-pointer"
              onClick={() => setExpandedMedia(image)}
            >
              <img 
                src={getMediaUrl(image.file_path)} 
                alt={image.caption || `Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      );
    }
    
    // 3 or more images
    return (
      <div className="grid grid-cols-3 gap-2">
        {images.slice(0, 3).map((image, index) => (
          <div 
            key={image.id}
            className={`rounded-lg overflow-hidden h-24 cursor-pointer ${
              index === 0 ? "col-span-2 row-span-2 h-48" : ""
            }`}
            onClick={() => setExpandedMedia(image)}
          >
            <img 
              src={getMediaUrl(image.file_path)} 
              alt={image.caption || `Image ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {index === 2 && images.length > 3 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                +{images.length - 3} more
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Modal for expanded media view
  const renderExpandedMediaModal = () => {
    if (!expandedMedia) return null;
    
    return (
      <div 
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={() => setExpandedMedia(null)}
      >
        <div 
          className="max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <img 
            src={getMediaUrl(expandedMedia.file_path)} 
            alt={expandedMedia.caption || "Media"}
            className="max-w-full max-h-[80vh] object-contain"
          />
          {expandedMedia.caption && (
            <div className="text-white text-center mt-4 p-2 bg-black/30 rounded">
              {expandedMedia.caption}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="mt-4">
      {renderImageGrid()}
      {renderExpandedMediaModal()}
    </div>
  );
}
