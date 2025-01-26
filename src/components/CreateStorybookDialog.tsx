import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import FormField from "@/components/FormField";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface CreateStorybookDialogProps {
  onStorybookCreated: () => void;
}

const CreateStorybookDialog = ({ onStorybookCreated }: CreateStorybookDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from("storybooks")
      .insert([
        {
          title,
          description: description || null,
          profile_id: "11111111-1111-1111-1111-111111111111",
        },
      ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create storybook",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Storybook created successfully",
    });
    
    setOpen(false);
    setTitle("");
    setDescription("");
    onStorybookCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Storybook
        </Button>
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
            placeholder="Enter storybook title"
          />
          <FormField
            label="Description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter storybook description (optional)"
          />
          <Button type="submit" className="w-full">
            Create Storybook
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStorybookDialog;