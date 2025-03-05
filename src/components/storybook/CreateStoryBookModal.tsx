
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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
  const navigate = useNavigate();
  const { isAuthenticated, profileId, checkAuth } = useAuth();

  useEffect(() => {
    if (open) {
      checkAuth();
    }
  }, [open, checkAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated || !profileId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a storybook",
      });
      setOpen(false);
      navigate("/sign-in", { state: { redirectTo: "/storybooks" } });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Creating storybook with data:", {
        title: title.trim(),
        description: description.trim() || null,
        profile_id: profileId
      });
      
      const { data: storybook, error: storybookError } = await supabase
        .from("storybooks")
        .insert({ 
          title: title.trim(),
          description: description.trim() || null,
          profile_id: profileId // Add profile_id to the storybook
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

  // Use a different handler for the dialog trigger
  const handleOpenDialog = () => {
    if (!isAuthenticated) {
      checkAuth().then(isAuth => {
        if (!isAuth) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to create a storybook",
          });
          navigate("/sign-in", { state: { redirectTo: "/storybooks" } });
          return;
        }
        setOpen(true);
      });
    } else {
      setOpen(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={handleOpenDialog}>
        {children}
      </div>
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
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Storybook"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
