
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { CreateStoryBookForm } from "./CreateStoryBookForm";
import { useStoryBookAuth } from "@/hooks/useStoryBookAuth";

interface CreateStoryBookModalProps {
  onSuccess: () => void;
  children: React.ReactNode;
}

export function CreateStoryBookModal({ onSuccess, children }: CreateStoryBookModalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { authVerified, profileId, isAuthenticated, authLoading, checkAuth } = useStoryBookAuth(open);

  const handleOpenChange = (newOpenState: boolean) => {
    if (newOpenState) {
      // When opening, check auth first
      const checkAndOpen = async () => {
        const isAuth = await checkAuth();
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
      };
      checkAndOpen();
    } else {
      setOpen(newOpenState);
    }
  };

  const handleFormSuccess = () => {
    setOpen(false);
    onSuccess();
  };

  const handleFormCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div>{children}</div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" aria-describedby="storybook-modal-description">
        <DialogHeader>
          <DialogTitle>Create New Storybook</DialogTitle>
        </DialogHeader>
        <div id="storybook-modal-description" className="sr-only">Form to create a new storybook with title and optional description</div>
        {authLoading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Verifying authentication...</span>
          </div>
        ) : (
          <CreateStoryBookForm
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
            isAuthenticated={isAuthenticated}
            authVerified={authVerified}
            profileId={profileId}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
