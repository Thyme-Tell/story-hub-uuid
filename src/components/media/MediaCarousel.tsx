import React, { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ImageMedia from "@/components/ImageMedia";
import VideoMedia from "@/components/VideoMedia";
import { StoryMediaItem } from "@/types/media";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ImageCropper from "@/components/ImageCropper";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Crop, Trash2, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MediaCarouselProps {
  mediaItems: StoryMediaItem[];
  onCaptionUpdate: (mediaId: string, caption: string) => void;
  onDelete?: () => void;
}

const MediaCarousel = React.forwardRef<HTMLDivElement, MediaCarouselProps>(
  ({ mediaItems, onCaptionUpdate, onDelete }, ref) => {
    const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
    const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
    const [cropData, setCropData] = useState<{ url: string; mediaId: string } | null>(null);
    const { toast } = useToast();

    if (!mediaItems.length) return null;

    const handleImageClick = (url: string, mediaId: string) => {
      setSelectedMedia(url);
      setSelectedMediaId(mediaId);
    };

    const handleStartCrop = () => {
      if (selectedMedia && selectedMediaId) {
        setCropData({ url: selectedMedia, mediaId: selectedMediaId });
        setSelectedMedia(null);
      }
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
      if (!cropData) return;

      try {
        const fileExt = 'jpeg';
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('story-media')
          .upload(filePath, croppedBlob, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { error: updateError } = await supabase
          .from('story_media')
          .update({ file_path: filePath })
          .eq('id', cropData.mediaId);

        if (updateError) throw updateError;

        toast({
          title: "Success",
          description: "Image cropped successfully",
        });

        setCropData(null);

        if (onDelete) {
          onDelete();
        }
      } catch (error) {
        console.error('Error updating cropped image:', error);
        toast({
          title: "Error",
          description: "Failed to update cropped image",
          variant: "destructive",
        });
      }
    };

    const handleDelete = async () => {
      if (!selectedMediaId) return;

      try {
        const mediaToDelete = mediaItems.find(m => m.id === selectedMediaId);
        if (!mediaToDelete) return;

        const { error: storageError } = await supabase.storage
          .from("story-media")
          .remove([mediaToDelete.file_path]);

        if (storageError) throw storageError;

        const { error: dbError } = await supabase
          .from("story_media")
          .delete()
          .eq("id", selectedMediaId);

        if (dbError) throw dbError;

        toast({
          title: "Success",
          description: "Media deleted successfully",
        });

        setSelectedMedia(null);

        if (onDelete) {
          onDelete();
        }
      } catch (error) {
        console.error("Error deleting media:", error);
        toast({
          title: "Error",
          description: "Failed to delete media",
          variant: "destructive",
        });
      }
    };

    return (
      <div className="mb-8" ref={ref}>
        <div className="text-sm text-muted-foreground mb-2 text-center">
          {mediaItems.length} {mediaItems.length === 1 ? 'item' : 'items'}
        </div>
        <Carousel 
          className="w-[75%] mx-auto"
          opts={{
            align: "start",
            containScroll: false,
          }}
        >
          <CarouselContent className="-ml-2">
            {mediaItems.map((media) => {
              if (media.content_type.startsWith("image/")) {
                return (
                  <CarouselItem key={media.id} className="pl-2 basis-[85%]">
                    <ImageMedia
                      media={media}
                      onCaptionUpdate={onCaptionUpdate}
                      onDelete={onDelete}
                      onImageClick={(url) => handleImageClick(url, media.id)}
                      onStartCrop={(url) => handleImageClick(url, media.id)}
                    />
                  </CarouselItem>
                );
              }
              if (media.content_type.startsWith("video/")) {
                return (
                  <CarouselItem key={media.id} className="pl-2 basis-[85%]">
                    <VideoMedia
                      media={media}
                      onCaptionUpdate={onCaptionUpdate}
                      onDelete={onDelete}
                    />
                  </CarouselItem>
                );
              }
              return null;
            })}
          </CarouselContent>
          {mediaItems.length > 1 && (
            <>
              <CarouselPrevious />
              <CarouselNext />
            </>
          )}
        </Carousel>

        <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
          <DialogContent className="max-w-[90vw] max-h-[90vh] p-0" hideCloseButton>
            {selectedMedia && (
              <div className="relative">
                <img
                  src={selectedMedia}
                  alt="Enlarged view"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={handleStartCrop}
                  >
                    <Crop className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete this media.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setSelectedMedia(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {cropData && (
          <ImageCropper
            imageUrl={cropData.url}
            onCropComplete={handleCropComplete}
            onCancel={() => setCropData(null)}
            open={!!cropData}
          />
        )}
      </div>
    );
  }
);

MediaCarousel.displayName = "MediaCarousel";

export default MediaCarousel;