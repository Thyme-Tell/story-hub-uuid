import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

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
      className="block border rounded-lg p-6 hover:shadow-lg transition-shadow"
    >
      <h2 className="text-xl font-semibold mb-2">{storybook.title}</h2>
      {storybook.description && (
        <p className="text-gray-600 mb-4">{storybook.description}</p>
      )}
      <div className="text-sm text-gray-500">
        Created {formatDistanceToNow(new Date(storybook.created_at))} ago
      </div>
    </Link>
  );
}