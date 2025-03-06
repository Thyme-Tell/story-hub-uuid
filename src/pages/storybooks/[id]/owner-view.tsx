
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { withStoryBookOwnerAccess } from "@/components/storybook/withStoryBookOwnerAccess";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Member {
  profile_id: string;
  role: string;
  first_name: string;
  last_name: string;
  email: string;
}

function StoryBookOwnerView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profileId } = useAuth();

  const { data: storybook, isLoading } = useQuery({
    queryKey: ["storybook-owner-view", id, profileId],
    queryFn: async () => {
      if (!id) throw new Error("No storybook ID provided");

      const { data: storybookData, error: storybookError } = await supabase
        .from("storybooks")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (storybookError) throw storybookError;
      if (!storybookData) throw new Error("Storybook not found");
      
      // Use the security definer function to get members
      const { data: membersData, error: membersError } = await supabase
        .rpc('get_storybook_members', { _storybook_id: id });
        
      if (membersError) {
        console.error("Error fetching members:", membersError);
        throw membersError;
      }

      return {
        ...storybookData,
        storybook_members: membersData as Member[] || []
      };
    },
  });

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
        <h1 className="text-3xl font-bold">Owner View: {storybook.title}</h1>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/storybooks/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Storybook
          </Button>
          <Button 
            variant="default"
            className="bg-[#A33D29] hover:bg-[#A33D29]/90" 
            onClick={() => navigate(`/storybooks/${id}/settings`)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Owner Access Guaranteed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            As the owner of this storybook, you always have access to view and manage this storybook.
            This page is only accessible to storybook owners.
          </p>
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Storybook Details</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">Title:</div>
              <div>{storybook.title}</div>
              <div className="font-medium">Description:</div>
              <div>{storybook.description || "No description"}</div>
              <div className="font-medium">Created At:</div>
              <div>{new Date(storybook.created_at).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="font-medium text-lg">Member Count</h3>
            <p>
              This storybook has {storybook.storybook_members.length} member{storybook.storybook_members.length !== 1 ? 's' : ''}.
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/storybooks/${id}/settings`)}
            >
              Manage Members
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default withStoryBookOwnerAccess(StoryBookOwnerView);
