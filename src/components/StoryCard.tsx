import { useState } from "react";
import { useStoryOperations } from "./story/StoryOperations";
import StoryEditForm from "./StoryEditForm";
import StoryContent from "./StoryContent";
import StoryHeader from "./story/StoryHeader";
import ShareDialog from "./story/ShareDialog";

interface StoryCardProps {
  story: {
    id: string;
    title: string | null;
    content: string;
    created_at: string;
    share_token: string | null;
  };
  onUpdate: () => void;
}

const StoryCard = ({ story, onUpdate }: StoryCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  const { handleSave, handleDelete, handleShare } = useStoryOperations({
    storyId: story.id,
    onUpdate,
  });

  const onSave = async (title: string, content: string, date: Date) => {
    const success = await handleSave(title, content, date);
    if (success) {
      setIsEditing(false);
    }
  };

  const onShare = async () => {
    const useNativeShare = await handleShare(story);
    if (!useNativeShare) {
      setShowShareDialog(true);
    }
  };

  const shareUrl = story.share_token 
    ? `${window.location.origin}/stories/${story.share_token}`
    : null;

  return (
    <div className="p-4 pb-12 rounded-lg border bg-card text-card-foreground shadow-sm space-y-2">
      {isEditing ? (
        <StoryEditForm
          initialTitle={story.title || ""}
          initialContent={story.content}
          initialDate={new Date(story.created_at)}
          onSave={onSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <StoryHeader
            date={story.created_at}
            onEdit={() => setIsEditing(true)}
            onDelete={handleDelete}
            onShare={onShare}
          />
          <StoryContent
            title={story.title}
            content={story.content}
            storyId={story.id}
            onUpdate={onUpdate}
          />
        </>
      )}

      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        shareUrl={shareUrl}
      />
    </div>
  );
};

export default StoryCard;