import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MemberManagement } from "@/components/storybook/MemberManagement";
import { EditStoryBookModal } from "@/components/storybook/EditStoryBookModal";
import { withStoryBookAccess } from "@/components/storybook/withStoryBookAccess";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

function StoryBookSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: storybook, isLoading } = useQuery({
    queryKey: ["storybook", id],
    queryFn: async () => {
      if (!id) throw new Error("No storybook ID provided");

      const { data, error } = await supabase
        .from("storybooks")
        .select(`
          *,
          storybook_members!inner (
            profile_id,
            role,
            profiles!storybook_members_profile_id_fkey (
              first_name,
              last_name
            )
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async () => {
    try {
      if (!id) return;

      const { error } = await supabase
        .from("storybooks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Storybook deleted successfully",
      });
      navigate("/storybooks");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete storybook",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!storybook) {
    return <div className="container mx-auto p-6">Storybook not found</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button variant="ghost" onClick={() => navigate(`/storybooks/${id}`)}>
          Back to Storybook
        </Button>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update your storybook's title and description
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{storybook.title}</h3>
                <p className="text-sm text-gray-500">{storybook.description || "No description"}</p>
              </div>
              <EditStoryBookModal storybook={storybook} onSuccess={() => window.location.reload()} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Member Management</CardTitle>
            <CardDescription>
              Manage who has access to this storybook
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MemberManagement storyBookId={storybook.id} />
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Actions here cannot be undone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Storybook</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    storybook and remove all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withStoryBookAccess(StoryBookSettings);