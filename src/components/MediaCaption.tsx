import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MediaCaptionProps {
  mediaId: string;
  caption: string | null;
  onUpdate: (mediaId: string, caption: string) => void;
}

const MediaCaption = ({ mediaId, caption, onUpdate }: MediaCaptionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [captionText, setCaptionText] = useState(caption || "");

  const handleSubmit = () => {
    onUpdate(mediaId, captionText);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <Textarea
          value={captionText}
          onChange={(e) => setCaptionText(e.target.value)}
          placeholder="Add a caption..."
          className="w-full min-h-[80px]"
          rows={3}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSubmit}>
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
      onClick={() => setIsEditing(true)}
    >
      {caption || "Add a caption..."}
    </div>
  );
};

export default MediaCaption;