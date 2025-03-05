
import { useState } from "react";
import FormField from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

interface CreateStoryBookFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  isAuthenticated: boolean;
  authVerified: boolean;
  profileId: string | null;
}

export function CreateStoryBookForm({ 
  onSuccess, 
  onCancel,
  isAuthenticated,
  authVerified,
  profileId
}: CreateStoryBookFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication first
    if (!isAuthenticated || !profileId) {
      console.log("User not authenticated, redirecting to sign in");
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a storybook",
        variant: "destructive",
      });
      onCancel();
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
      
      // Get the user ID from cookies first as it's more reliable in this app's context
      const storedProfileId = Cookies.get('profile_id');
      let userId = storedProfileId;
      
      // Also try to get session as a backup
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          console.log("Active session found, user ID:", sessionData.session.user.id);
          // If we have both, prefer the session user ID
          userId = sessionData.session.user.id;
        } else {
          console.log("No active session found, falling back to cookie-based auth");
          if (!userId) {
            throw new Error("No user ID found. Please sign in again.");
          }
        }
      } catch (sessionError) {
        console.error("Error checking session:", sessionError);
        // Continue with cookie-based ID if session check fails
        if (!userId) {
          throw new Error("Failed to verify user. Please sign in again.");
        }
      }
      
      // Verify the user ID exists in profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();
        
      if (profileError || !profileData) {
        console.error("Error verifying profile:", profileError);
        throw new Error("Could not verify your account. Please sign in again.");
      }

      // Use our new database function to create the storybook and add owner in one transaction
      // Explicitly cast the function name as const to satisfy TypeScript
      const functionName = 'create_storybook_with_owner' as const;
      const { data: storybook, error: storybookError } = await supabase.rpc(
        functionName,
        {
          _title: title.trim(),
          _description: description.trim() || null,
          _profile_id: userId
        }
      );

      if (storybookError) {
        console.error("Error creating storybook:", storybookError);
        throw storybookError;
      }

      if (!storybook) {
        console.error("No storybook data returned");
        throw new Error("No storybook data returned after creation");
      }

      console.log("Storybook created successfully:", storybook);
      
      toast({
        title: "Success",
        description: "Storybook created successfully",
      });
      
      setTitle("");
      setDescription("");
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

  return (
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
  );
}
