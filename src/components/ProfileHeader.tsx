
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { Library } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  profileId: string;
}

const ProfileHeader = ({ firstName, lastName, profileId, onUpdate }: ProfileHeaderProps & { onUpdate: () => void }) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleCreateStory = async () => {
    const { data, error } = await supabase
      .from("stories")
      .insert([
        {
          content: content,
          title: title,
          profile_id: profileId
        }
      ])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Could not create a new story",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "New story created",
    });
    
    setIsDialogOpen(false);
    setTitle("");
    setContent("");
    onUpdate();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold font-sans text-left">
          {firstName} {lastName}'s Stories
        </h1>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="flex items-center gap-2"
        >
          <Link to="/storybooks">
            <Library className="h-4 w-4" />
            <span>Storybooks</span>
          </Link>
        </Button>
      </div>
      <Button 
        className="w-full bg-[#A33D29] hover:bg-[#A33D29]/90 text-white"
        onClick={() => setIsDialogOpen(true)}
      >
        Write a New Story
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a New Story</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your story"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Story</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your story here..."
                className="min-h-[200px]"
              />
            </div>
            <Button 
              className="w-full bg-[#A33D29] hover:bg-[#A33D29]/90 text-white"
              onClick={handleCreateStory}
            >
              Save Story
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileHeader;
