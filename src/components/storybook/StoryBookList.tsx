import { StoryBookCard } from "./StoryBookCard";

interface StoryBook {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

interface StoryBookListProps {
  storybooks: StoryBook[];
  isLoading: boolean;
}

export function StoryBookList({ storybooks, isLoading }: StoryBookListProps) {
  if (isLoading) {
    return <div className="text-gray-500">Loading storybooks...</div>;
  }

  if (!storybooks?.length) {
    return <div className="text-gray-500">No storybooks found</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {storybooks.map((storybook) => (
        <StoryBookCard key={storybook.id} storybook={storybook} />
      ))}
    </div>
  );
}