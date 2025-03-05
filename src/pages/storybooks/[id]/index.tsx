
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditStoryBookModal } from "@/components/storybook/EditStoryBookModal";
import { StoryFeed } from "@/components/storybook/StoryFeed";
import { MemberManagement } from "@/components/storybook/MemberManagement";
import { Button } from "@/components/ui/button";
import { Settings, ArrowLeft, Book, Plus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function StoryBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState("newest");

  const { data: storybook, isLoading, refetch } = useQuery({
    queryKey: ["storybook", id],
    queryFn: async () => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!storybook) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Storybook not found</h2>
          <Button onClick={() => navigate('/storybooks')}>
            Back to storybooks
          </Button>
        </div>
      </div>
    );
  }

  // Extract contributors (people who have added stories)
  const contributors = storybook.storybook_members?.map(member => ({
    id: member.profile_id,
    name: `${member.profiles.first_name} ${member.profiles.last_name}`,
    initials: `${member.profiles.first_name?.[0] || ''}${member.profiles.last_name?.[0] || ''}`,
  })) || [];

  return (
    <div className="relative min-h-screen">
      {/* Hero section with background image */}
      <div className="relative h-[40vh] bg-gray-900">
        {/* Background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/lovable-uploads/3fdf47ff-e26f-4341-a118-eb0bf6493d37.png')`,
            opacity: 0.7
          }}
        />
        
        {/* Top navigation */}
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
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white/20 backdrop-blur-sm rounded-full h-12 w-12"
            >
              <Book className="h-6 w-6 text-white" />
            </Button>
            
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
        
        {/* Storybook title and description */}
        <div className="absolute bottom-8 left-6 right-6 text-white">
          <h1 className="text-5xl font-bold mb-2">{storybook.title}</h1>
          {storybook.description && (
            <p className="text-xl text-white/80">{storybook.description}</p>
          )}
          <button className="text-white/80 mt-2">See more..</button>
          
          {/* Contributors */}
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
      
      {/* Content area */}
      <div className="bg-gray-100 min-h-[60vh] p-4">
        {/* Filter/sort controls */}
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
        
        {/* Stories feed */}
        <StoryFeed
          storyBookId={storybook.id}
          sortOrder={sortOrder}
        />
      </div>
      
      {/* Floating action button for adding new stories */}
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
