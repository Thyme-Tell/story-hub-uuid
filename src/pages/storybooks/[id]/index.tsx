import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoryFeed } from "@/components/storybook/StoryFeed";
import { Button } from "@/components/ui/button";
import { Settings, ArrowLeft, Book, Plus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useStoryBookPermissions } from "@/hooks/useStoryBookPermissions";

interface Member {
  profile_id: string;
  role: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function StoryBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState("newest");
  const { toast } = useToast();
  const { profileId } = useAuth();
  const { isOwner } = useStoryBookPermissions(id || '');

  const { data: storybook, isLoading, error } = useQuery({
    queryKey: ["storybook", id, profileId],
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

  const contributors = storybook.storybook_members.map(member => ({
    id: member.profile_id,
    name: `${member.first_name} ${member.last_name}`,
    initials: `${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`,
  }));

  return (
    <div className="relative min-h-screen">
      <div className="relative h-[40vh] bg-gray-900">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/lovable-uploads/3fdf47ff-e26f-4341-a118-eb0bf6493d37.png')`,
            opacity: 0.7
          }}
        />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-white/20 backdrop-blur-sm rounded-full h-12 w-12"
            onClick={() => navigate('/storybooks')}
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </Button>
          
          <div className="flex gap-2">
            {isOwner && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-white/20 backdrop-blur-sm rounded-full h-12 w-12"
                asChild
              >
                <Link to={`/storybooks/${storybook.id}/owner`}>
                  <span className="sr-only">Owner View</span>
                  <Book className="h-6 w-6 text-white" />
                </Link>
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white/20 backdrop-blur-sm rounded-full h-12 w-12"
              asChild
            >
              <Link to={`/storybooks/${storybook.id}/settings`}>
                <Settings className="h-6 w-6 text-white" />
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-6 right-6 text-white">
          <h1 className="text-5xl font-bold mb-2">{storybook.title}</h1>
          {storybook.description && (
            <p className="text-xl text-white/80">{storybook.description}</p>
          )}
          <button className="text-white/80 mt-2">See more..</button>
          
          <div className="flex items-center mt-4">
            <div className="flex -space-x-2">
              {contributors.slice(0, 3).map((contributor) => (
                <Avatar key={contributor.id} className="border-2 border-white h-10 w-10">
                  <AvatarFallback>{contributor.initials}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="ml-3 text-white/90">
              {contributors.length === 1 
                ? '1 contributor' 
                : `${contributors.length} contributors`}
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-100 min-h-[60vh] p-4">
        <div className="mb-6">
          <Select 
            value={sortOrder} 
            onValueChange={setSortOrder}
          >
            <SelectTrigger className="w-full md:w-64 bg-white">
              <SelectValue placeholder="Sort stories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest memory</SelectItem>
              <SelectItem value="oldest">Oldest memory</SelectItem>
              <SelectItem value="alphabetical">A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <StoryFeed
          storyBookId={storybook.id}
          sortOrder={sortOrder}
        />
      </div>
      
      <div className="fixed bottom-8 right-8">
        <Button 
          className="h-16 w-16 rounded-full bg-[#A33D29] hover:bg-[#A33D29]/90 shadow-lg"
          asChild
        >
          <Link to={`/storybooks/${storybook.id}/add-story`}>
            <Plus className="h-8 w-8" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
