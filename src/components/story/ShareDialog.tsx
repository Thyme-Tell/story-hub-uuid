import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string | null;
}

const ShareDialog = ({ open, onOpenChange, shareUrl }: ShareDialogProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const copyShareLink = async () => {
    if (!shareUrl) {
      toast({
        title: "Error",
        description: "Share link not available",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast({
        title: "Success",
        description: "Share link copied to clipboard",
      });
      
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Story</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={shareUrl || ""}
              readOnly
              className="flex-1"
            />
            <Button onClick={copyShareLink}>
              {isCopied ? "Copied" : "Copy"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Anyone with this link can view this story
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;