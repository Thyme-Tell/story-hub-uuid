
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

  // Check auth when modal opens
  useEffect(() => {
    const checkAuthentication = async () => {
      if (open) {
        console.log("Modal opened, checking auth...");
        const isAuthed = await checkAuth();
        console.log("Auth check result:", { isAuthed, profileId });
        
        if (!isAuthed) {
          console.log("Not authenticated, redirecting to sign-in...");
          setOpen(false);
          navigate("/sign-in", { state: { redirectTo: "/storybooks" } });
        }
      }
    };
    
    checkAuthentication();
  }, [open, checkAuth, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted, checking auth state:", { isAuthenticated, profileId });

    if (!isAuthenticated || !profileId) {
      console.log("Not authenticated during submit, redirecting...");
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a storybook",
        variant: "destructive",
      });
      setOpen(false);
      navigate("/sign-in", { state: { redirectTo: "/storybooks" } });
      return;
    }

    if (!title.trim()) {
      console.log("Title is empty");
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log("Starting storybook creation...");

    try {
      // First create the storybook
      const { data: storybook, error: storybookError } = await supabase
        .from("storybooks")
        .insert({ 
          title: title.trim(),
          description: description.trim() || null,
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

      // Then create the membership
      const { error: memberError } = await supabase
        .from("storybook_members")
        .insert({
          storybook_id: storybook.id,
          profile_id: profileId,
          role: "owner",
          added_by: profileId,
        });

      if (memberError) {
        console.error("Error creating storybook membership:", memberError);
        throw memberError;
      }

      console.log("Storybook membership created successfully");

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
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
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Storybook"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
