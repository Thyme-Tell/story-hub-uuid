import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pen } from "lucide-react";

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
}

const ProfileHeader = ({ firstName, lastName }: ProfileHeaderProps) => {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold font-sans">
        {firstName} {lastName}'s Stories
      </h1>
      <Button className="w-full sm:w-auto" variant="outline">
        <Pen className="mr-2 h-4 w-4" />
        Write Story
      </Button>
    </div>
  );
};

export default ProfileHeader;