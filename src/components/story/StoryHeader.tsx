import StoryActions from "@/components/StoryActions";

interface StoryHeaderProps {
  date: string;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
}

const StoryHeader = ({ date, onEdit, onDelete, onShare }: StoryHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <p className="text-sm text-muted-foreground text-left">
        {new Date(date).toLocaleDateString()}
      </p>
      <StoryActions
        onEdit={onEdit}
        onDelete={onDelete}
        onShare={onShare}
      />
    </div>
  );
};

export default StoryHeader;