import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, PlusCircle, MinusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
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

interface Story {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
}

interface Storybook {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  stories: Story[];
}

const Storybooks = () => {
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!session || error) {
        toast({
          title: "Authentication required",
          description: "Please sign in to access storybooks",
          variant: "destructive",
        });
        navigate("/signin");
      }
    };
    checkAuth();
  }, [navigate, toast]);

  // First get the authenticated user's email
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!session) throw new Error("No authenticated session");
      return session;
    },
  });

  // Then get the profile using the authenticated user's email
  const { data: profile } = useQuery({
    queryKey: ["profile", session?.user?.email],
    queryFn: async () => {
      if (!session?.user?.email) {
        throw new Error("No authenticated user");
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", session.user.email)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Profile not found");
      
      return data;
    },
    enabled: !!session?.user?.email,
  });

  const { data: storybooks, refetch: refetchStorybooks } = useQuery({
    queryKey: ["storybooks", profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error("No profile ID available");

      const { data: storybooksData, error: storybooksError } = await supabase
        .from("storybooks")
        .select("*, storybook_stories(story_id, stories(*))")
        .eq("profile_id", profile.id);

      if (storybooksError) throw storybooksError;

      return storybooksData.map((storybook: any) => ({
        ...storybook,
        stories: storybook.storybook_stories.map((ss: any) => ss.stories),
      }));
    },
    enabled: !!profile?.id,
  });

  const { data: availableStories } = useQuery({
    queryKey: ["available-stories", profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error("No profile ID available");

      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select("*")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false });

      if (storiesError) throw storiesError;
      return storiesData;
    },
    enabled: !!profile?.id,
  });

  const handleCreateStorybook = async () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a storybook",
        variant: "destructive",
      });
      navigate("/signin");
      return;
    }

    if (!newTitle.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.id) {
      toast({
        title: "Error",
        description: "Profile not found",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("storybooks").insert({
      title: newTitle,
      description: newDescription,
      profile_id: profile.id,
    });

    if (error) {
      console.error("Error creating storybook:", error);
      toast({
        title: "Error",
        description: "Failed to create storybook: " + error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Storybook created successfully",
    });
    setNewTitle("");
    setNewDescription("");
    setIsDialogOpen(false);
    refetchStorybooks();
  };

  const handleDeleteStorybook = async (id: string) => {
    const { error } = await supabase.from("storybooks").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete storybook",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Storybook deleted successfully",
    });
    refetchStorybooks();
  };

  const handleAddStory = async (storybookId: string, storyId: string) => {
    const { error } = await supabase.from("storybook_stories").insert({
      storybook_id: storybookId,
      story_id: storyId,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add story to storybook",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Story added to storybook successfully",
    });
    refetchStorybooks();
  };

  const handleRemoveStory = async (storybookId: string, storyId: string) => {
    const { error } = await supabase
      .from("storybook_stories")
      .delete()
      .match({ storybook_id: storybookId, story_id: storyId });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove story from storybook",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Story removed from storybook successfully",
    });
    refetchStorybooks();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Storybooks</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Storybook</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Storybook</DialogTitle>
              <DialogDescription>
                Create a new storybook to organize your stories.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <Textarea
                placeholder="Description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
              <Button onClick={handleCreateStorybook}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storybooks?.map((storybook: Storybook) => (
          <div
            key={storybook.id}
            className="border rounded-lg p-6 space-y-4 bg-card"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{storybook.title}</h2>
                {storybook.description && (
                  <p className="text-muted-foreground mt-1">
                    {storybook.description}
                  </p>
                )}
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Storybook</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this storybook? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteStorybook(storybook.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Stories</h3>
              {storybook.stories?.map((story: Story) => (
                <div
                  key={story.id}
                  className="flex justify-between items-center p-2 bg-muted rounded"
                >
                  <span>{story.title || "Untitled Story"}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveStory(storybook.id, story.id)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Story
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Story to Storybook</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {availableStories?.map((story: Story) => (
                      <div
                        key={story.id}
                        className="flex justify-between items-center p-2 bg-muted rounded"
                      >
                        <span>{story.title || "Untitled Story"}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddStory(storybook.id, story.id)}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Storybooks;
