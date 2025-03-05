
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Image, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddStoryPageProps {
  storyBookId: string;
}

export default function AddStoryPage({ storyBookId }: AddStoryPageProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profileId } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileId) {
      toast({
        title: "Not authenticated",
        description: "You must be signed in to add a story.",
        variant: "destructive",
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please add some content to your story.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First create the story
      const { data: storyData, error: storyError } = await supabase
        .from("stories")
        .insert({
          profile_id: profileId,
          title: title.trim() || null,
          content: content.trim(),
        })
        .select()
        .single();
      
      if (storyError) throw storyError;
      
      // Then add it to the storybook
      const { error: linkError } = await supabase
        .from("storybook_stories")
        .insert({
          storybook_id: storyBookId,
          story_id: storyData.id,
          added_by: profileId,
        });
      
      if (linkError) throw linkError;
      
      toast({
        title: "Story added",
        description: "Your story has been added to the storybook.",
      });
      
      // Return to the storybook page
      navigate(`/storybooks/${storyBookId}`);
    } catch (error) {
      console.error("Error adding story:", error);
      toast({
        title: "Failed to add story",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white p-4 shadow-sm flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/storybooks/${storyBookId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to storybook
        </Button>
        
        <Button 
          disabled={isSubmitting || !content.trim()} 
          onClick={handleSubmit}
          className="bg-[#A33D29] hover:bg-[#A33D29]/90"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center">
              <Send className="mr-2 h-4 w-4" />
              Add to storybook
            </span>
          )}
        </Button>
      </div>
      
      <div className="container mx-auto p-4 md:p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              placeholder="Story title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold bg-white"
            />
          </div>
          
          <div>
            <Textarea
              placeholder="Write your story here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] text-lg bg-white"
              required
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="outline"
              className="flex items-center"
              // Note: Media upload functionality would be added in future iterations
            >
              <Image className="mr-2 h-4 w-4" />
              Add media
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
