import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import CreateStorybookDialog from "@/components/CreateStorybookDialog";
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
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Storybooks = () => {
  const { toast } = useToast();
  
  const { data: storybooks, isLoading, refetch } = useQuery({
    queryKey: ["storybooks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("storybooks")
        .select(`
          id,
          title,
          description,
          created_at,
          storybook_stories(
            story:stories(
              id,
              title,
              content
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch storybooks",
          variant: "destructive",
        });
        return [];
      }

      return data;
    },
  });

  const handleDelete = async (storybookId: string) => {
    const { error } = await supabase
      .from("storybooks")
      .delete()
      .eq("id", storybookId);

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
    
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Loading storybooks...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full flex justify-between items-center py-4 px-4 bg-white/80">
        <img 
          src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/narra-logo.svg?t=2025-01-22T21%3A53%3A58.812Z" 
          alt="Narra Logo"
          className="h-11"
        />
      </div>
      <div className="p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Storybooks</h1>
            <CreateStorybookDialog onStorybookCreated={refetch} />
          </div>
          
          {storybooks?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No storybooks yet. Create your first one!
            </p>
          ) : (
            <div className="grid gap-4">
              {storybooks?.map((storybook) => (
                <div key={storybook.id} className="relative">
                  <Link
                    to={`/storybooks/${storybook.id}`}
                    className="block"
                  >
                    <div className="p-4 rounded-lg border bg-card text-card-foreground text-left hover:bg-accent transition-colors">
                      <h3 className="font-semibold text-lg">{storybook.title}</h3>
                      {storybook.description && (
                        <p className="text-muted-foreground mt-1">
                          {storybook.description}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-2">
                        {storybook.storybook_stories.length} stories
                      </p>
                    </div>
                  </Link>
                  <div className="absolute top-4 right-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => e.preventDefault()}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this storybook
                            and remove it from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(storybook.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Storybooks;