
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Story } from "@/types/supabase";
import { useToast } from "@/hooks/use-toast";

export function useBookPreview(profileId: string, open: boolean) {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showToc, setShowToc] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [storyPages, setStoryPages] = useState<number[]>([]);
  const [totalPageCount, setTotalPageCount] = useState(1); // Cover page by default
  const { toast } = useToast();

  const { data: stories, isLoading: isStoriesLoading } = useQuery({
    queryKey: ["stories", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching stories:", error);
        toast({
          title: "Error",
          description: "Failed to load stories for preview",
          variant: "destructive",
        });
        return [];
      }

      return data as Story[];
    },
    enabled: open,
  });

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
    enabled: open,
  });

  // Calculate total pages and starting page for each story
  useEffect(() => {
    if (!stories || stories.length === 0) {
      setStoryPages([]);
      setTotalPageCount(1); // Just the cover
      return;
    }

    let pageCount = 1; // Start with cover page
    const pageStartIndices: number[] = [];

    stories.forEach((story) => {
      pageStartIndices.push(pageCount);
      
      // Improved page calculation logic
      // Characters per page (considering 14pt font, 5x8 inch format)
      const CHARS_PER_PAGE = 1800;
      
      // Calculate pages needed for this story
      const contentLength = story.content.length;
      
      // First page has title and date, so less space for content
      const firstPageCapacity = CHARS_PER_PAGE - 150; // Reserve 150 chars for title/date
      
      let pagesNeeded = 1; // Start with one page
      let remainingContent = contentLength - firstPageCapacity;
      
      if (remainingContent > 0) {
        // Add extra pages as needed
        pagesNeeded += Math.ceil(remainingContent / CHARS_PER_PAGE);
      }
      
      // Add media consideration - if story has media, it may need an extra page
      // This would require fetching media for each story, but for now we'll estimate
      // For a basic approximation, we'll add 0.5 pages on average for media
      pagesNeeded = Math.max(1, Math.ceil(pagesNeeded + 0.5));
      
      pageCount += pagesNeeded;
    });

    setStoryPages(pageStartIndices);
    setTotalPageCount(pageCount);
  }, [stories]);

  const goToNextPage = () => {
    if (currentPage < totalPageCount - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getCurrentStoryIndex = () => {
    if (currentPage === 0) return -1; // Cover page
    
    for (let i = storyPages.length - 1; i >= 0; i--) {
      if (currentPage >= storyPages[i]) {
        return i;
      }
    }
    return -1;
  };

  const getPageWithinStory = () => {
    const storyIndex = getCurrentStoryIndex();
    if (storyIndex === -1) return 0;
    
    return currentPage - storyPages[storyIndex] + 1;
  };

  const zoomIn = () => {
    setZoomLevel(Math.min(2, zoomLevel + 0.1));
  };

  const zoomOut = () => {
    setZoomLevel(Math.max(0.5, zoomLevel - 0.1));
  };

  const toggleBookmark = () => {
    if (bookmarks.includes(currentPage)) {
      setBookmarks(bookmarks.filter(b => b !== currentPage));
    } else {
      setBookmarks([...bookmarks, currentPage]);
    }
  };

  const toggleToc = () => {
    setShowToc(!showToc);
  };

  const jumpToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
    setShowToc(false);
  };

  useEffect(() => {
    if (open) {
      setCurrentPage(0);
      setZoomLevel(1);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      switch (e.key) {
        case "ArrowRight":
          goToNextPage();
          break;
        case "ArrowLeft":
          goToPrevPage();
          break;
        case "Escape":
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentPage, totalPageCount]);

  return {
    currentPage,
    zoomLevel,
    showToc,
    bookmarks,
    storyPages,
    totalPageCount,
    stories,
    profile,
    isStoriesLoading,
    goToNextPage,
    goToPrevPage,
    getCurrentStoryIndex,
    getPageWithinStory,
    zoomIn,
    zoomOut,
    toggleBookmark,
    toggleToc,
    jumpToPage
  };
}
