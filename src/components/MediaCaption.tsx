import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <div className="flex gap-2">
        <Input
          value={captionText}
          onChange={(e) => setCaptionText(e.target.value)}
          placeholder="Add a caption..."
          className="flex-1"
        />
        <Button size="sm" onClick={handleSubmit}>
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
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