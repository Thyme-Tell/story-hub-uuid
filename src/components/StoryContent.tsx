
import { useState } from "react";
import StoryMediaUpload from "./StoryMediaUpload";
import StoryMedia from "./StoryMedia";
import { Button } from "@/components/ui/button";
import { Headphones } from "lucide-react";
import AudioPlayer from "./AudioPlayer";
import { useStoryAudio } from "@/hooks/useStoryAudio";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface StoryContentProps {
  title: string | null;
  content: string;
  storyId: string;
  onUpdate: () => void;
}

const StoryContent = ({ title, content, storyId, onUpdate }: StoryContentProps) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const { isLoading, audioUrl, generateAudio, updatePlaybackStats } = useStoryAudio(storyId);
  const paragraphs = content.split('\n').filter(p => p.trim() !== '');

  const handleListen = async () => {
    if (!audioUrl) {
      await generateAudio();
    }
    setShowPlayer(true);
  };

  return (
    <div className="px-6 pb-6">
      <div className="flex justify-between items-center mb-6">
        {title && (
          <h3 className="font-semibold text-2xl text-[#242F3F]">{title}</h3>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleListen}
          disabled={isLoading}
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
      
      {showPlayer && audioUrl && (
        <div className="mb-6">
          <AudioPlayer audioUrl={audioUrl} onPlay={updatePlaybackStats} />
        </div>
      )}
      
      <div className="prose prose-stone max-w-none">
        {paragraphs.map((paragraph, index) => (
          <p 
            key={index} 
            className="text-[#242F3F] text-lg leading-relaxed mb-4 font-['Georgia']"
          >
            {paragraph}
          </p>
        ))}
      </div>
      
      <div className="mt-8 mb-4">
        <StoryMediaUpload storyId={storyId} onUploadComplete={onUpdate} />
      </div>
      <StoryMedia storyId={storyId} />
    </div>
  );
};

export default StoryContent;
