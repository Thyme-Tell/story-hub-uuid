
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Book } from "lucide-react";

interface StoryBook {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

interface StoryBookCardProps {
  storybook: StoryBook;
}

export function StoryBookCard({ storybook }: StoryBookCardProps) {
  return (
    <Link
      to={`/storybooks/${storybook.id}`}
      className="block bg-white/90 border rounded-lg p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-[#A33D29]/10 rounded-full">
          <Book className="h-5 w-5 text-[#A33D29]" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">{storybook.title}</h2>
          {storybook.description && (
            <p className="text-gray-600 mb-4 line-clamp-2">{storybook.description}</p>
          )}
          <div className="text-sm text-gray-500">
            Created {formatDistanceToNow(new Date(storybook.created_at))} ago
          </div>
        </div>
      </div>
    </Link>
  );
}
