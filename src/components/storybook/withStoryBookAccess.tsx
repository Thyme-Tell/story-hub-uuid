import { useNavigate } from "react-router-dom";
import { useStoryBookPermissions } from "@/hooks/useStoryBookPermissions";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    const { isOwner, canEdit, isLoading, error } = useStoryBookPermissions(storyBookId);
    const navigate = useNavigate();
    const { toast } = useToast();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }

    if (error) {
      toast({
        title: "Error",
        description: "Failed to verify permissions",
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