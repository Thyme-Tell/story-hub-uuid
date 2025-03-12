import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCoverData } from "@/hooks/useCoverData";
import { calculateTotalPages } from "@/utils/bookPagination";
import { Story } from "@/types/supabase";
import { Pencil, BookOpen, BookText } from "lucide-react";
import BookProgressHeader from "./book-progress/BookProgressHeader";
import BookCoverPreview from "./book-progress/BookCoverPreview";
import BookEditorModals from "./book-progress/BookEditorModals";
import { CoverData } from "./cover/CoverTypes";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export function BookProgress({ profileId }: { profileId: string }) {
  const [isHidden, setIsHidden] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const navigate = useNavigate();
  
  const { 
    coverData, 
    saveCoverData, 
    isLoading: isCoverLoading, 
    refreshCoverData 
  } = useCoverData(profileId);
  
  const { data: profile } = useQuery({
    queryKey: ["profile", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", profileId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      
      return data;
    },
  });

  const { data: stories = [] } = useQuery({
    queryKey: ["stories", profileId],
    queryFn: async () => {
      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select("id, title, content, created_at, share_token")
        .eq("profile_id", profileId);

      if (storiesError) {
        console.error("Error fetching stories:", storiesError);
        return [];
      }

      return storiesData as Story[];
    },
  });

  const currentPageCount = stories.length ? calculateTotalPages(stories) : 1;

  useEffect(() => {
    if (profileId) {
      console.log('BookProgress: Refreshing cover data for profile:', profileId);
      refreshCoverData();
    }
  }, [profileId, refreshCoverData]);

  const handleOpenCoverEditor = () => {
    refreshCoverData();
    setIsEditorOpen(true);
  };

  const handleCloseCoverEditor = () => {
    setIsEditorOpen(false);
  };

  const handleSaveCover = async (newCoverData: CoverData) => {
    console.log("Saving new cover data:", newCoverData);
    await saveCoverData(newCoverData);
    refreshCoverData();
  };

  const handlePreviewBook = () => {
    navigate(`/book-preview/${profileId}`);
  };

  const scrollToTableOfContents = () => {
    const tocElement = document.querySelector('[data-toc-container]');
    if (tocElement) {
      tocElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isHidden) {
    return null;
  }

  if (!stories?.length) {
    return <BookProgressHeader setIsHidden={setIsHidden} />;
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold">{coverData.titleText || "My Stories"}</h1>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleOpenCoverEditor}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mb-4">
            <p className="text-base text-muted-foreground">by {profile?.first_name} {profile?.last_name}</p>
          </div>

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
        </div>

        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4">
            <BookCoverPreview 
              coverData={coverData}
              isLoading={isCoverLoading}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handlePreviewBook}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Preview Book
            </Button>

            <Button
              variant="outline"
              onClick={handleOpenCoverEditor}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Cover
            </Button>
          </div>

          <Button
            variant="secondary"
            className="w-full relative bg-[#b3b3b3] hover:bg-[#a6a6a6] text-[#4d4d4d]"
            disabled
          >
            <span className="inline-flex items-center">
              <span className="bg-[#AF4623] text-white text-xs px-2 py-0.5 rounded-full mr-2">
                Coming Soon
              </span>
              Order Book
            </span>
          </Button>
        </div>
      </div>

      <BookEditorModals
        profileId={profileId}
        isEditorOpen={isEditorOpen}
        isPreviewOpen={false}
        coverData={coverData}
        onCloseCoverEditor={handleCloseCoverEditor}
        onClosePreview={() => {}}
        onSaveCover={handleSaveCover}
      />
    </div>
  );
}
