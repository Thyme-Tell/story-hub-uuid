
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { StoryBookList } from "@/components/storybook/StoryBookList";
import { CreateStoryBookModal } from "@/components/storybook/CreateStoryBookModal";
import { supabase } from "@/integrations/supabase/client";
import { Menu, Library } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { StoryBook } from "@/types/supabase";

const StoryBooks = () => {
  const { toast } = useToast();
  const [storybooks, setStorybooks] = useState<StoryBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const { isAuthenticated, profileId, checkAuth } = useAuth();

  useEffect(() => {
    document.title = "Narra Story | Storybooks";
    
    // Check authentication on initial load with immediate feedback
    const initialAuthCheck = async () => {
      const isAuth = await checkAuth();
      console.log('Authentication status on load:', isAuth, 'Profile ID:', profileId);
      
      if (isAuth && profileId) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('id', profileId)
            .maybeSingle();

          if (error || !profile) {
            console.error('Error fetching profile:', error);
            return;
          }

          setFirstName(profile.first_name);
        } catch (error) {
          console.error('Error checking profile:', error);
        }
      }
    };

    initialAuthCheck();
    fetchStorybooks();
  }, [profileId, checkAuth]);

  const fetchStorybooks = async () => {
    try {
      setIsLoading(true);
      
      // Fetch storybooks
      const { data, error } = await supabase
        .from('storybooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching storybooks:', error);
        throw error;
      }
      
      setStorybooks(data || []);
    } catch (error) {
      console.error('Error fetching storybooks:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load storybooks",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      return;
    }
    window.location.href = '/';
  };

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
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to="/" className="flex items-center gap-2">
                <span>Home</span>
              </Link>
            </DropdownMenuItem>
            {isAuthenticated ? (
              <>
                <DropdownMenuItem asChild>
                  <Link to={`/profile/${profileId}`} className="flex items-center gap-2">
                    <span>My Stories</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-[#A33D29]">
                  Not {firstName}? Log Out
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem asChild>
                <Link to="/sign-in" className="flex items-center gap-2">
                  <span>Sign In</span>
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="container mx-auto py-8 px-4">
        <Link to="/" className="text-[#A33D29] hover:underline mb-4 inline-block">
          ← Back to Stories
        </Link>
        <div className="flex justify-between items-center mb-8 mt-4">
          <h1 className="text-3xl font-bold">Storybooks</h1>
          <CreateStoryBookModal onSuccess={fetchStorybooks}>
            <Button
              className="bg-[#A33D29] hover:bg-[#A33D29]/90 text-white"
            >
              Create New Storybook
            </Button>
          </CreateStoryBookModal>
        </div>

        <StoryBookList storybooks={storybooks} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default StoryBooks;
