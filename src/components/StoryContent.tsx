
import { useState } from "react";
import StoryMediaUpload from "./StoryMediaUpload";
import StoryMedia from "./StoryMedia";
import { Button } from "@/components/ui/button";
import { Headphones, Plus } from "lucide-react";
import AudioPlayer from "./AudioPlayer";
import { useStoryAudio } from "@/hooks/useStoryAudio";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format } from "date-fns";

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
      <div className="flex flex-col mb-8">
        {title && (
          <div className="space-y-2 mb-6">
            <h1 className="font-caslon text-4xl font-bold text-atlantic">{title}</h1>
            <div className="flex justify-between items-center">
              <time className="text-sm text-atlantic/70 uppercase tracking-wider">
                JUL 11, 1990
              </time>
              <span className="text-sm text-atlantic/70">Mia Peroff</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleListen}
            disabled={isLoading}
            className="rounded-full px-4 py-2 border-atlantic/20 hover:border-atlantic/40 transition-colors"
          >
            {isLoading ? (
              <LoadingSpinner className="mr-2 h-4 w-4" />
            ) : (
              <Headphones className="mr-2 h-4 w-4" />
            )}
            Listen
            <span className="mx-2 text-atlantic/40">·</span>
            <span>5m</span>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-8 h-8 border-atlantic/20 hover:border-atlantic/40 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Record audio</span>
          </Button>
        </div>
      </div>
      
      {showPlayer && audioUrl && (
        <div className="mb-8">
          <AudioPlayer audioUrl={audioUrl} onPlay={updatePlaybackStats} />
        </div>
      )}
      
      <div className="prose prose-stone max-w-none">
        {paragraphs.map((paragraph, index) => (
          <p 
            key={index} 
            className="text-atlantic text-lg leading-relaxed mb-6 font-caslon"
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
