
import React from "react";
import { Story } from "@/types/supabase";
import { StoryMediaItem } from "@/types/media";
import { supabase } from "@/integrations/supabase/client";

interface MediaPageViewProps {
  story: Story;
  mediaItem: StoryMediaItem;
  globalPageNumber: number;
  bookTitle: string;
}

const MediaPageView = ({ 
  story, 
  mediaItem, 
  globalPageNumber, 
  bookTitle 
}: MediaPageViewProps) => {

  const getPublicUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from("story-media")
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  return (
    <div className="w-full h-full overflow-auto p-3 sm:p-6 bg-white book-page flex flex-col items-center justify-center">
      <div className="text-center italic text-green-800 font-serif pt-6 w-full">
        {bookTitle}
      </div>
      
      <div className="max-w-full max-h-[75%] flex justify-center items-center flex-1">
        {mediaItem.content_type.startsWith("image/") ? (
          <div className="max-h-full flex flex-col items-center">
            <div className="media-display">
              <img 
                src={getPublicUrl(mediaItem.file_path)} 
                alt={mediaItem.caption || "Image"} 
                className="max-h-[60vh] max-w-full object-contain rounded-lg" 
                onError={(e) => {
                  console.error("Error loading image:", e);
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/placeholder.svg";
                }}
              />
            </div>
            {mediaItem.caption && (
              <p className="text-sm text-center italic mt-3 text-gray-500 text-[12pt] mx-auto max-w-[80%] no-indent">
                {mediaItem.caption}
              </p>
            )}
          </div>
        ) : mediaItem.content_type.startsWith("video/") ? (
          <div className="media-display flex flex-col items-center">
            <video 
              src={getPublicUrl(mediaItem.file_path)} 
              controls 
              className="max-h-[60vh] max-w-full rounded-lg"
              onError={(e) => {
                console.error("Error loading video:", e);
                const target = e.target as HTMLVideoElement;
                target.onerror = null;
              }}
            >
              Your browser does not support the video tag.
            </video>
            {mediaItem.caption && (
              <p className="text-sm text-center italic mt-3 text-gray-500 text-[12pt] mx-auto max-w-[80%] no-indent">
                {mediaItem.caption}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center p-4 bg-gray-100 rounded">
            Unsupported media type: {mediaItem.content_type}
          </div>
        )}
      </div>
      
      <div className="absolute bottom-8 w-full text-center">
        <span className="text-gray-700">{globalPageNumber}</span>
      </div>
    </div>
  );
};

export default MediaPageView;
