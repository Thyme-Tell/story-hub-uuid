import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StoryMediaUpload from "./StoryMediaUpload";
import StoryMedia from "./StoryMedia";
import { MoreVertical, Pencil, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface StoryCardProps {
  story: {
    id: string;
    title: string | null;
    content: string;
    created_at: string;
  };
  onUpdate: () => void;
}

const StoryCard = ({ story, onUpdate }: StoryCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(story.title || "");
  const [editContent, setEditContent] = useState(story.content);
  const [date, setDate] = useState<Date>(new Date(story.created_at));
  const { toast } = useToast();

  const handleSave = async () => {
    const { error } = await supabase
      .from("stories")
      .update({
        title: editTitle,
        content: editContent,
        created_at: date.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", story.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update story",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Story updated successfully",
    });
    
    setIsEditing(false);
    onUpdate();
  };

  const handleDelete = async () => {
    // First, get the story details
    const { data: storyData, error: storyError } = await supabase
      .from("stories")
      .select("*, profiles(id)")
      .eq("id", story.id)
      .single();

    if (storyError) {
      toast({
        title: "Error",
        description: "Failed to fetch story details",
        variant: "destructive",
      });
      return;
    }

    // Insert into deleted_stories
    const { error: insertError } = await supabase
      .from("deleted_stories")
      .insert({
        original_id: story.id,
        profile_id: storyData.profile_id,
        content: storyData.content,
        title: storyData.title,
        created_at: storyData.created_at,
        updated_at: storyData.updated_at,
      });

    if (insertError) {
      toast({
        title: "Error",
        description: "Failed to archive story",
        variant: "destructive",
      });
      return;
    }

    // Delete from stories
    const { error: deleteError } = await supabase
      .from("stories")
      .delete()
      .eq("id", story.id);

    if (deleteError) {
      toast({
        title: "Error",
        description: "Failed to delete story",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Story deleted successfully",
    });
    
    onUpdate();
  };

  return (
    <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm space-y-2">
      {isEditing ? (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-x-0 top-0 z-50 bg-background p-6 shadow-lg h-screen overflow-y-auto">
            <div className="space-y-4 max-w-2xl mx-auto">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Story title"
                className="w-full text-left"
              />
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[calc(100vh-200px)] text-left"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div className="flex space-x-2">
                <Button onClick={handleSave}>Save</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground text-left">
              {new Date(story.created_at).toLocaleDateString()}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will move this story to the archive. You can't undo this action.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {story.title && (
            <h3 className="font-semibold text-lg text-left">{story.title}</h3>
          )}
          <p className="whitespace-pre-wrap text-atlantic text-left">{story.content}</p>
          <div className="mt-[30px] mb-[20px]">
            <StoryMediaUpload storyId={story.id} onUploadComplete={onUpdate} />
          </div>
          <StoryMedia storyId={story.id} />
        </>
      )}
    </div>
  );
};

export default StoryCard;