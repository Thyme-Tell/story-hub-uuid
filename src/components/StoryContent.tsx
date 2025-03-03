
import { useState } from "react";
import StoryMediaUpload from "./StoryMediaUpload";
import StoryMedia from "./StoryMedia";
import { Button } from "@/components/ui/button";
import { Headphones, User, Volume2 } from "lucide-react";
import AudioPlayer from "./AudioPlayer";
import { useStoryAudio } from "@/hooks/useStoryAudio";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface StoryContentProps {
  title: string | null;
  content: string;
  storyId: string;
  onUpdate: () => void;
}

const StoryContent = ({ title, content, storyId, onUpdate }: StoryContentProps) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const { toast } = useToast();
  const { 
    isLoading, 
    audioUrl, 
    isPersonalized,
    generateAudio, 
    updatePlaybackStats,
    error 
  } = useStoryAudio(storyId);
  
  const paragraphs = content.split('\n').filter(p => p.trim() !== '');

  const handleListen = async (usePersonalizedVoice = false) => {
    try {
      if (!audioUrl || (usePersonalizedVoice !== isPersonalized)) {
        const result = await generateAudio({ usePersonalizedVoice });
        if (result?.error) {
          throw new Error(result.error);
        }
      }
      setShowPlayer(true);
    } catch (err) {
      console.error("Error in handleListen:", err);
      toast({
        title: "Error",
        description: "Failed to generate audio. Please try again.",
        variant: "destructive",
      });
    }
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
              className="ml-auto flex items-center"
            >
              {isLoading ? (
                <LoadingSpinner className="mr-2 h-4 w-4" />
              ) : (
                <Headphones className="mr-2 h-4 w-4" />
              )}
              Listen
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuItem onClick={() => handleListen(false)} className="flex items-center py-2">
              <Volume2 className="mr-2 h-4 w-4 text-gray-500" />
              <div>
                <div>Standard Voice</div>
                <div className="text-xs text-muted-foreground">Default ElevenLabs voice</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleListen(true)} className="flex items-center py-2">
              <User className="mr-2 h-4 w-4 text-[#A33D29]" />
              <div>
                <div className="text-[#A33D29]">Storyteller's Voice</div>
                <div className="text-xs text-muted-foreground">Personalized voice of the author</div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {showPlayer && audioUrl && (
        <div className="mb-4">
          <AudioPlayer 
            audioUrl={audioUrl} 
            onPlay={updatePlaybackStats} 
            isPersonalized={isPersonalized} 
          />
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
