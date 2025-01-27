import { useParams } from "react-router-dom";
import SharedStoryComponent from "@/components/SharedStory";

const SharedStoryPage = () => {
  const { token } = useParams();

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Invalid share link</p>
      </div>
    );
  }

  return <SharedStoryComponent shareToken={token} />;
};

export default SharedStoryPage;