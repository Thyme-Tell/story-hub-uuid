import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

interface BookProgressProps {
  profileId: string;
}

const BookProgress = ({ profileId }: BookProgressProps) => {
  const [isHidden, setIsHidden] = useState(false);
  
  const { data: stories } = useQuery({
    queryKey: ["stories", profileId],
    queryFn: async () => {
      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select("content")
        .eq("profile_id", profileId);

      if (storiesError) {
        console.error("Error fetching stories:", storiesError);
        return [];
      }

      return storiesData;
    },
  });

  const calculatePages = (stories: { content: string }[] | undefined) => {
    if (!stories) return 0;
    
    const totalCharacters = stories.reduce((acc, story) => {
      return acc + (story.content?.length || 0);
    }, 0);

    // Using 1500 characters per page as a conservative estimate
    return Math.ceil(totalCharacters / 1500);
  };

  const currentPages = calculatePages(stories);
  const requiredPages = 25;
  const remainingPages = Math.max(0, requiredPages - currentPages);
  const progressPercentage = Math.min((currentPages / requiredPages) * 100, 100);

  if (isHidden) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg bg-white/50 p-6 shadow-sm">
      <div className="flex flex-col">
        <img
          src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/hand-heart.png?t=2025-01-27T11%3A17%3A37.419Z"
          alt="Hand holding a heart"
          className="h-64 w-64 object-contain mx-auto mb-6"
        />
        <div>
          <h2 className="text-xl font-semibold text-atlantic mb-2 text-left">Keep it up!</h2>
          <p className="text-atlantic mb-4 text-left">
            You have {currentPages} {currentPages === 1 ? 'page' : 'pages'} in your book.
            {remainingPages > 0 ? (
              ` You need ${remainingPages} more ${remainingPages === 1 ? 'page' : 'pages'} to order your book.`
            ) : (
              " You have enough pages to order your book!"
            )}
          </p>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>
      <button 
        onClick={() => setIsHidden(true)}
        className="w-full text-center mt-4 text-sm text-atlantic/70 hover:text-atlantic"
      >
        Remind me later
      </button>
    </div>
  );
};

export default BookProgress;