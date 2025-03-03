
import { useState } from "react";
import StoryMediaUpload from "./StoryMediaUpload";
import StoryMedia from "./StoryMedia";
import { Button } from "@/components/ui/button";
import { Headphones, User } from "lucide-react";
import AudioPlayer from "./AudioPlayer";
import { useStoryAudio } from "@/hooks/useStoryAudio";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StoryContentProps {
  title: string | null;
  content: string;
  storyId: string;
  onUpdate: () => void;
}

const StoryContent = ({ title, content, storyId, onUpdate }: StoryContentProps) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const { 
    isLoading, 
    audioUrl, 
    isPersonalized,
    generateAudio, 
    updatePlaybackStats 
  } = useStoryAudio(storyId);
  
  const paragraphs = content.split('\n').filter(p => p.trim() !== '');

  const handleListen = async (usePersonalizedVoice = false) => {
    if (!audioUrl || (usePersonalizedVoice && !isPersonalized)) {
      await generateAudio({ usePersonalizedVoice });
    }
    setShowPlayer(true);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        {title && (
          <h3 className="font-semibold text-lg text-left">{title}</h3>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
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
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleListen(false)}>
              Standard Voice
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleListen(true)}>
              <User className="mr-2 h-4 w-4" />
              Storyteller's Voice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {showPlayer && audioUrl && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            {isPersonalized && (
              <span className="text-sm text-[#A33D29] flex items-center mr-2">
                <User className="h-3 w-3 mr-1" />
                Storyteller's voice
              </span>
            )}
          </div>
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
