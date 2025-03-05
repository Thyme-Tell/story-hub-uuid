
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface CreateStoryBookModalProps {
  onSuccess: () => void;
  children: React.ReactNode;
}

export function CreateStoryBookModal({ onSuccess, children }: CreateStoryBookModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authVerified, setAuthVerified] = useState(false);
  const { toast } = useToast();
  const { profileId, isAuthenticated, checkAuth, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Run an authentication check when modal opens
  useEffect(() => {
    if (open) {
      const verifyAuth = async () => {
        const isAuth = await checkAuth();
        console.log("Auth verification result:", isAuth, "Profile ID:", profileId);
        setAuthVerified(isAuth && !!profileId);
      };
      verifyAuth();
    }
  }, [open, checkAuth, profileId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication first
    const isAuth = await checkAuth();
    if (!isAuth || !profileId) {
      console.log("User not authenticated, redirecting to sign in");
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a storybook",
        variant: "destructive",
      });
      setOpen(false);
      navigate('/sign-in', { state: { redirectTo: '/storybooks' } });
      return;
    }

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
      console.log("Creating storybook with profile ID:", profileId);
      
      // Get current user session to ensure we're authenticated
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error("No active session found. Please sign in again.");
      }
      
      const userId = sessionData.session.user.id;
      console.log("Session user ID:", userId);
      
      if (userId !== profileId) {
        console.log("User ID mismatch: Session userId:", userId, "Profile ID:", profileId);
        // Use the session user ID as it's more reliable
      }

      // Step 1: Create the storybook
      const { data: storybook, error: storybookError } = await supabase
        .from("storybooks")
        .insert({ 
          title: title.trim(),
          description: description.trim() || null
        })
        .select()
        .single();

      if (storybookError) {
        console.error("Error creating storybook:", storybookError);
        throw storybookError;
      }

      if (!storybook) {
        console.error("No storybook data returned");
        throw new Error("No storybook data returned after creation");
      }

      console.log("Storybook created successfully:", storybook);
      
      // Step 2: Add the current user as owner using the verified session user ID
      const { error: memberError } = await supabase
        .from("storybook_members")
        .insert({
          storybook_id: storybook.id,
          profile_id: userId, // Use the session user ID here
          role: "owner",
          added_by: userId // Use the session user ID here as well
        });

      if (memberError) {
        console.error("Error adding member to storybook:", memberError);
        throw memberError;
      }

      toast({
        title: "Success",
        description: "Storybook created successfully",
      });
      
      setTitle("");
      setDescription("");
      setOpen(false);
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

  const handleOpenChange = (newOpenState: boolean) => {
    if (newOpenState) {
      // When opening, check auth first
      const checkAndOpen = async () => {
        setIsLoading(true);
        const isAuth = await checkAuth();
        setIsLoading(false);
        if (!isAuth) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to create a storybook",
            variant: "destructive",
          });
          navigate('/sign-in', { state: { redirectTo: '/storybooks' } });
          return;
        }
        setOpen(true);
        setAuthVerified(true);
      };
      checkAndOpen();
    } else {
      setOpen(newOpenState);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div>{children}</div>
      </DialogTrigger>
      <DialogContent aria-label="Create New Storybook">
        <DialogHeader>
          <DialogTitle>Create New Storybook</DialogTitle>
        </DialogHeader>
        {authLoading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Verifying authentication...</span>
          </div>
        ) : (
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
              disabled={isLoading || !isAuthenticated || !authVerified}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Storybook"
              )}
            </Button>
            {!isAuthenticated && (
              <p className="text-sm text-red-500 text-center">
                Please sign in to create a storybook
              </p>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
