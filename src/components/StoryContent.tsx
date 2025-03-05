
import { useState } from "react";
import StoryMediaUpload from "./StoryMediaUpload";
import StoryMedia from "./StoryMedia";
import { Button } from "@/components/ui/button";
import { Headphones } from "lucide-react";
import AudioPlayer from "./AudioPlayer";
import { useStoryAudio } from "@/hooks/useStoryAudio";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";

interface StoryContentProps {
  title: string | null;
  content: string;
  storyId: string;
  onUpdate: () => void;
}

const StoryContent = ({ title, content, storyId, onUpdate }: StoryContentProps) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const { isLoading, audioUrl, error, generateAudio, updatePlaybackStats } = useStoryAudio(storyId);
  const paragraphs = content.split('\n').filter(p => p.trim() !== '');
  const { toast } = useToast();

  const handleListen = async () => {
    console.log('Listen button clicked for story:', storyId);
    
    if (!content || content.trim() === '') {
      toast({
        title: "Cannot Generate Audio",
        description: "This story has no content. Please add some text before generating audio.",
        variant: "destructive",
      });
      return;
    }
    
    if (!audioUrl) {
      console.log('No existing audio URL, requesting audio...');
      try {
        const generatedUrl = await generateAudio();
        if (generatedUrl) {
          setShowPlayer(true);
        }
      } catch (err) {
        console.error('Error in handleListen:', err);
        // Error already handled in useStoryAudio hook
      }
    } else {
      setShowPlayer(true);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        {title && (
          <h3 className="font-semibold text-lg text-left">{title}</h3>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleListen}
          disabled={isLoading || !content || content.trim() === ''}
          className="ml-auto"
        >
          {isLoading ? (
            <LoadingSpinner className="mr-2 h-4 w-4" />
          ) : (
            <Headphones className="mr-2 h-4 w-4" />
          )}
          Listen
        </Button>
      </div>
      
      {error && (
        <div className="text-red-500 mb-4 p-2 bg-red-50 rounded-md text-sm">
          Error: {error}
        </div>
      )}
      
      {content && content.trim() === '' && (
        <div className="text-amber-700 mb-4 p-2 bg-amber-50 rounded-md text-sm">
          This story has no content. Add some text to generate audio.
        </div>
      )}
      
      {showPlayer && audioUrl && (
        <div className="mb-4">
          <AudioPlayer audioUrl={audioUrl} onPlay={updatePlaybackStats} />
        </div>
      )}
      
      <div className="text-atlantic text-left">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="whitespace-pre-wrap mb-[10px]">
            {paragraph}
          </p>
        ))}
      </div>
      
      <div className="mt-[30px] mb-[20px]">
        <StoryMediaUpload storyId={storyId} onUploadComplete={onUpdate} />
      </div>
      <StoryMedia storyId={storyId} />
    </>
  );
};

export default StoryContent;
