
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface CreateStoryBookModalProps {
  onSuccess: () => void;
  children: React.ReactNode;
}

export function CreateStoryBookModal({ onSuccess, children }: CreateStoryBookModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { profileId, isAuthenticated, checkAuth } = useAuth();
  const navigate = useNavigate();

  // Run an authentication check when modal opens
  useEffect(() => {
    if (open) {
      checkAuth();
    }
  }, [open, checkAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication first
    if (!isAuthenticated || !profileId) {
      console.log("User not authenticated, redirecting to sign in");
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a storybook",
        variant: "destructive",
      });
      setOpen(false);
      navigate('/sign-in', { state: { redirectTo: '/storybooks' } });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Creating storybook with data:", {
        title: title.trim(),
        description: description.trim() || null,
        profileId
      });
      
      // Step 1: Create the storybook
      const { data: storybook, error: storybookError } = await supabase
        .from("storybooks")
        .insert({ 
          title: title.trim(),
          description: description.trim() || null
        })
        .select()
        .single();

      if (storybookError) {
        console.error("Error creating storybook:", storybookError);
        throw storybookError;
      }

      if (!storybook) {
        console.error("No storybook data returned");
        throw new Error("No storybook data returned after creation");
      }

      console.log("Storybook created successfully:", storybook);
      
      // Step 2: Now add the current user as owner to the storybook_members table
      const { error: memberError } = await supabase
        .from("storybook_members")
        .insert({
          storybook_id: storybook.id,
          profile_id: profileId,
          role: "owner",
          added_by: profileId
        });

      if (memberError) {
        console.error("Error adding member to storybook:", memberError);
        throw memberError;
      }

      toast({
        title: "Success",
        description: "Storybook created successfully",
      });
      
      setTitle("");
      setDescription("");
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error in storybook creation:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create storybook",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpenState: boolean) => {
    if (newOpenState && !isAuthenticated) {
      // If trying to open and not authenticated, check auth first
      const checkAndOpen = async () => {
        const isAuth = await checkAuth();
        if (!isAuth) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to create a storybook",
            variant: "destructive",
          });
          navigate('/sign-in', { state: { redirectTo: '/storybooks' } });
          return;
        }
        setOpen(true);
      };
      checkAndOpen();
    } else {
      setOpen(newOpenState);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div>{children}</div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Storybook</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <FormField
            label="Description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
          <Button
            type="submit"
            className="w-full bg-[#A33D29] hover:bg-[#A33D29]/90 text-white"
            disabled={isLoading || !isAuthenticated}
          >
            {isLoading ? "Creating..." : "Create Storybook"}
          </Button>
          {!isAuthenticated && (
            <p className="text-sm text-red-500 text-center">
              Please sign in to create a storybook
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
