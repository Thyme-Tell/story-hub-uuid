
import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import ProfileHeader from "@/components/ProfileHeader";
import StoriesList from "@/components/StoriesList";
import BookProgress from "@/components/BookProgress";
import { Menu, User, Mic, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [hasVoice, setHasVoice] = useState<boolean | null>(null);

  const isValidUUID = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (!isValidUUID && !window.location.pathname.includes('/sign-in')) {
    return <Navigate to="/sign-in" replace />;
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      if (!isValidUUID) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, created_at, synthflow_voice_id")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        // Check if the error is about the missing column
        if (error.message && error.message.includes("column 'synthflow_voice_id' does not exist")) {
          console.warn("The synthflow_voice_id column doesn't exist yet");
          
          // Get the profile without the synthflow_voice_id column
          const { data: profileWithoutVoice, error: profileError } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, created_at")
            .eq("id", id)
            .maybeSingle();
            
          if (profileError) {
            console.error("Error fetching profile:", profileError);
            return null;
          }
          
          // Set voice status to false since column doesn't exist
          setHasVoice(false);
          
          // Return the profile with an added null synthflow_voice_id
          return {
            ...profileWithoutVoice,
            synthflow_voice_id: null
          };
        } else {
          console.error("Error fetching profile:", error);
          return null;
        }
      }
      
      // Set the voice status
      setHasVoice(!!data?.synthflow_voice_id);
      
      return data;
    },
    enabled: isValidUUID,
  });

  const { data: stories, isLoading: isLoadingStories, refetch: refetchStories } = useQuery({
    queryKey: ["stories", id],
    queryFn: async () => {
      if (!isValidUUID) return [];
      
      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select("id, title, content, created_at, share_token")
        .eq("profile_id", id)
        .order("created_at", { ascending: false });

      if (storiesError) {
        console.error("Error fetching stories:", storiesError);
        return [];
      }

      return storiesData;
    },
    enabled: isValidUUID,
  });

  useEffect(() => {
    if (profile) {
      document.title = `Narra Story | ${profile.first_name}'s Profile`;
    } else {
      document.title = "Narra Story | Profile";
    }
  }, [profile]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      return;
    }
    navigate('/');
  };

  const requestVoiceSetup = async () => {
    toast({
      title: "Voice setup",
      description: "We'll contact you to set up your personalized voice for storytelling.",
    });
    
    // Here you could implement an actual contact request
    // For now we'll just show a notification
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!profile && isValidUUID) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg">Profile not found</p>
          <Link to="/" className="text-primary hover:underline">
            Sign up for Narra
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-background"
      style={{
        backgroundImage: `url('/lovable-uploads/e730ede5-8b2e-436e-a398-0c62ea70f30c.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full flex justify-between items-center py-4 px-4 bg-white/80">
        <img 
          src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/narra-logo.svg?t=2025-01-22T21%3A53%3A58.812Z" 
          alt="Narra Logo"
          className="h-11"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="h-[24px] w-[24px] scale-[1.6]" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {hasVoice === false && (
              <>
                <DropdownMenuItem onClick={requestVoiceSetup} className="text-[#A33D29] flex items-center">
                  <Mic className="mr-2 h-4 w-4" />
                  Set up your storyteller voice
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {hasVoice === true && (
              <>
                <div className="flex items-center px-2 py-1.5 text-sm">
                  <User className="mr-2 h-4 w-4 text-[#A33D29]" />
                  <span>Personalized voice is active</span>
                </div>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={handleLogout} className="text-[#A33D29]">
              Not {profile?.first_name}? Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <BookProgress profileId={id} />
          {profile && (
            <ProfileHeader 
              firstName={profile.first_name} 
              lastName={profile.last_name}
              profileId={profile.id}
              onUpdate={refetchStories}
            />
          )}
          
          <div>
            <p className="text-muted-foreground mb-[15px] text-left">
              or call Narra at <a href="tel:+15072003303" className="text-[#A33D29] hover:underline">+1 (507) 200-3303</a> for a friendly interview.
            </p>
            
            <StoriesList 
              stories={stories || []}
              isLoading={isLoadingStories}
              onUpdate={refetchStories}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
