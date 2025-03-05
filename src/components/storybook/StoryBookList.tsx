
import { StoryBookCard } from "./StoryBookCard";
import { Loader2 } from "lucide-react";

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
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#A33D29] mb-4" />
        <div className="text-gray-600">Loading storybooks...</div>
      </div>
    );
  }

  if (!storybooks?.length) {
    return (
      <div className="bg-white/80 rounded-lg p-8 text-center">
        <div className="text-gray-600 mb-4">No storybooks found</div>
        <p className="text-gray-500 max-w-md mx-auto">
          Create a new storybook to get started by clicking the "Create New Storybook" button above.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {storybooks.map((storybook) => (
        <StoryBookCard key={storybook.id} storybook={storybook} />
      ))}
    </div>
  );
}
