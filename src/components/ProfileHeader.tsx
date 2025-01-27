import { Link } from "react-router-dom";

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
}

const ProfileHeader = ({ firstName, lastName }: ProfileHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold font-sans text-gray-900">
        Welcome, {firstName}!
      </h1>
    </div>
  );
};

export default ProfileHeader;