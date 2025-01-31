import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

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

    setIsLoading(true);

    try {
      // Get the current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error("Failed to get user data: " + userError.message);
      }
      
      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      console.log("Creating storybook with title:", title);
      
      // Create the storybook
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
        throw new Error("No storybook data returned after creation");
      }

      console.log("Storybook created:", storybook);

      // Create owner membership
      const { error: memberError } = await supabase
        .from("storybook_members")
        .insert({
          storybook_id: storybook.id,
          profile_id: userData.user.id,
          role: "owner",
          added_by: userData.user.id,
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
      
      // Reset form and close modal
      setTitle("");
      setDescription("");
      setOpen(false);
      
      // Notify parent component to refresh the list
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