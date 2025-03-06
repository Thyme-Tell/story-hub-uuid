
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

interface WithStoryBookOwnerAccessProps {
  storyBookId: string;
}

export function withStoryBookOwnerAccess<P extends WithStoryBookOwnerAccessProps>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithStoryBookOwnerAccessWrapper(props: P) {
    const { storyBookId } = props;
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isAuthenticated, checkAuth, profileId, isLoading: authLoading } = useAuth();

    // Check authentication on component mount
    useEffect(() => {
      const verifyAuth = async () => {
        const isAuth = await checkAuth();
        if (!isAuth) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to access this page",
            variant: "destructive",
          });
          navigate('/sign-in', { state: { redirectTo: window.location.pathname } });
        }
      };
      
      verifyAuth();
    }, [checkAuth, navigate, toast]);

    // Check if the user is the owner
    const { data: isOwner, isLoading: isCheckingOwner } = useQuery({
      queryKey: ["storybook-owner-check", storyBookId, profileId],
      queryFn: async () => {
        if (!isAuthenticated || !profileId) return false;

        const { data: roleData, error } = await supabase.rpc(
          'get_storybook_member_role',
          { 
            _storybook_id: storyBookId,
            _profile_id: profileId 
          }
        );

        if (error) {
          console.error("Error checking owner status:", error);
          return false;
        }

        return roleData === 'owner';
      },
      enabled: !!isAuthenticated && !!profileId && !!storyBookId,
    });

    // Show loading state while checking
    if (authLoading || isCheckingOwner) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Verifying ownership...</span>
        </div>
      );
    }

    // Deny access if not owner
    if (!isOwner) {
      toast({
        title: "Access Denied",
        description: "Only storybook owners can access this page",
        variant: "destructive",
      });
      navigate(`/storybooks/${storyBookId}`);
      return null;
    }

    // All checks passed, render the wrapped component
    return <WrappedComponent {...props} />;
  };
}
