import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageCropper from "./ImageCropper";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useStoryMedia } from "@/hooks/useStoryMedia";
import { useMediaOperations } from "@/hooks/useMediaOperations";
import ImageMedia from "./ImageMedia";
import VideoMedia from "./VideoMedia";
import { supabase } from "@/integrations/supabase/client";

interface StoryMediaProps {
  storyId: string;
}

const StoryMedia = ({ storyId }: StoryMediaProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [cropMediaId, setCropMediaId] = useState<string | null>(null);

  const { data: mediaItems, isLoading, refetch } = useStoryMedia(storyId);
  const { updateMedia, updateCaption } = useMediaOperations(storyId);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 0.5));
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setZoomLevel(1);
  };

  const handleCloseDialog = () => {
    setSelectedImage(null);
    setZoomLevel(1);
  };

  const handleStartCrop = (imageUrl: string, mediaId: string) => {
    setCropImageUrl(imageUrl);
    setCropMediaId(mediaId);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (cropMediaId) {
      updateMedia.mutate({ mediaId: cropMediaId, file: croppedBlob });
      setCropImageUrl(null);
      setCropMediaId(null);
    }
  };

  if (!mediaItems?.length) return null;

  return (
    <>
      <div className="mt-4">
        <div className="text-sm text-muted-foreground mb-2 text-center">
          {mediaItems.length} {mediaItems.length === 1 ? 'item' : 'items'}
        </div>
        <Carousel className="w-[55%] mx-auto">
          <CarouselContent>
            {mediaItems.map((media) => {
              if (media.content_type.startsWith("image/")) {
                return (
                  <CarouselItem key={media.id}>
                    <ImageMedia
                      media={media}
                      onImageClick={handleImageClick}
                      onStartCrop={handleStartCrop}
                      onCaptionUpdate={(mediaId, caption) => 
                        updateCaption.mutate({ mediaId, caption })
                      }
                      onDelete={refetch}
                    />
                  </CarouselItem>
                );
              }

              if (media.content_type.startsWith("video/")) {
                return (
                  <CarouselItem key={media.id}>
                    <VideoMedia
                      media={media}
                      onCaptionUpdate={(mediaId, caption) => 
                        updateCaption.mutate({ mediaId, caption })
                      }
                      onDelete={refetch}
                    />
                  </CarouselItem>
                );
              }

              const { data } = supabase.storage
                .from("story-media")
                .getPublicUrl(media.file_path);

              return (
                <CarouselItem key={media.id}>
                  <div className="rounded-lg bg-muted p-4 flex items-center justify-center aspect-square">
                    <a
                      href={data.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-center break-words hover:underline"
                    >
                      {media.file_name}
                    </a>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-[90vw] w-fit h-[90vh] flex flex-col">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="h-full flex items-center justify-center">
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Full screen view"
                  className="max-h-full object-contain transition-transform duration-200"
                  style={{
                    transform: `scale(${zoomLevel})`,
                  }}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {cropImageUrl && (
        <ImageCropper
          imageUrl={cropImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCropImageUrl(null);
            setCropMediaId(null);
          }}
          open={!!cropImageUrl}
        />
      )}
    </>
  );
};

export default StoryMedia;