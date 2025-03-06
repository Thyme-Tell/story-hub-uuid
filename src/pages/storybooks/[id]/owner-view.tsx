
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { withStoryBookOwnerAccess } from "@/components/storybook/withStoryBookOwnerAccess";

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

  const { data: storybook, isLoading, error } = useQuery({
    queryKey: ["storybook-owner", id, profileId],
    queryFn: async () => {
      try {
        if (!id) throw new Error("No storybook ID provided");
        
        const { data: storybookData, error: storybookError } = await supabase
          .from("storybooks")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (storybookError) {
          console.error("Error fetching storybook:", storybookError);
          throw storybookError;
        }
        
        if (!storybookData) {
          throw new Error("Storybook not found");
        }
        
        // Use the security definer function to get members
        const { data: membersData, error: membersError } = await supabase
          .rpc('get_storybook_members', { _storybook_id: id });
          
        if (membersError) {
          console.error("Error fetching storybook members:", membersError);
          throw membersError;
        }
        
        return {
          ...storybookData,
          storybook_members: membersData as Member[] || []
        };
      } catch (err) {
        console.error("Failed to fetch storybook:", err);
        toast({
          title: "Error",
          description: "Failed to load storybook. Please try again.",
          variant: "destructive",
        });
        throw err;
      }
    },
    retry: 1,
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
  
  if (error || !storybook) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Storybook not found</h2>
          <p className="text-gray-500 mb-4">
            {error ? `Error: ${(error as Error).message}` : "The storybook you're looking for doesn't exist."}
          </p>
          <Button onClick={() => navigate('/storybooks')}>
            Back to storybooks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/storybooks')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to storybooks
          </Button>
          <h1 className="text-3xl font-bold">{storybook.title} (Owner View)</h1>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate(`/storybooks/${id}`)}
          >
            View Regular Page
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(`/storybooks/${id}/settings`)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Storybook Details</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Title</h3>
            <p>{storybook.title}</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700">Description</h3>
            <p>{storybook.description || "No description provided"}</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700">Created</h3>
            <p>{new Date(storybook.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Members ({storybook.storybook_members.length})</h2>
        <div className="space-y-4">
          {storybook.storybook_members.map((member) => (
            <div key={member.profile_id} className="p-4 border rounded-md">
              <div className="font-medium">{member.first_name} {member.last_name}</div>
              <div className="text-sm text-gray-600">{member.email}</div>
              <div className="mt-1 inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                {member.role}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default withStoryBookOwnerAccess(StoryBookOwnerView);
