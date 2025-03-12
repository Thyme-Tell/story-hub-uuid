
import { BookOpen, BookText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Story } from "@/types/supabase";
import { calculateTotalPages } from "@/utils/bookPagination";

interface BookProgressStatsProps {
  stories: Story[];
  scrollToTableOfContents: () => void;
}

const BookProgressStats = ({ stories, scrollToTableOfContents }: BookProgressStatsProps) => {
  const currentPageCount = stories.length ? calculateTotalPages(stories) : 1;
  
  return (
    <div className="bg-muted/30 rounded-lg p-4 mb-6">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center text-muted-foreground">
          <BookOpen className="h-4 w-4 mr-2 text-[#155B4A]" />
          <span className="text-foreground font-medium">{currentPageCount}</span>&nbsp;<span>pages</span>
          <span className="text-xs ml-2">(Minimum: 32)</span>
        </div>
        
        <div className="flex items-center text-muted-foreground">
          <BookText className="h-4 w-4 mr-2 text-[#A33D29]" />
          <span className="text-foreground font-medium">{stories.length}</span>&nbsp;<span>stories</span>
          <Button 
            variant="link" 
            className="h-auto p-0 ml-2 text-[#A33D29]"
            onClick={scrollToTableOfContents}
          >
            View stories
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookProgressStats;
