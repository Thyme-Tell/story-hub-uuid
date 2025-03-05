
import { useNavigate } from "react-router-dom";
import { useStoryBookPermissions } from "@/hooks/useStoryBookPermissions";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

interface WithStoryBookAccessProps {
  storyBookId: string;
  requireOwner?: boolean;
  requireEdit?: boolean;
}

export function withStoryBookAccess<P extends WithStoryBookAccessProps>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithStoryBookAccessWrapper(props: P) {
    const { storyBookId, requireOwner, requireEdit } = props;
    const { isOwner, canEdit, isLoading: permissionsLoading, error: permissionsError } = useStoryBookPermissions(storyBookId);
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isAuthenticated, checkAuth, isLoading: authLoading } = useAuth();

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

    // Show loading state while checking auth or permissions
    if (authLoading || !isAuthenticated) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Verifying authentication...</span>
        </div>
      );
    }

    if (permissionsLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Checking permissions...</span>
        </div>
      );
    }

    if (permissionsError) {
      console.error("Permission check error:", permissionsError);
      toast({
        title: "Error",
        description: "Failed to verify permissions. Please try again.",
        variant: "destructive",
      });
      navigate("/storybooks");
      return null;
    }

    if (requireOwner && !isOwner) {
      toast({
        title: "Access Denied",
        description: "You need to be the owner to access this page",
        variant: "destructive",
      });
      navigate("/storybooks");
      return null;
    }

    if (requireEdit && !canEdit) {
      toast({
        title: "Access Denied",
        description: "You need edit permissions to access this page",
        variant: "destructive",
      });
      navigate("/storybooks");
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
