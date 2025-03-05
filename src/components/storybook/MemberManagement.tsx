import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RoleSelector } from "./RoleSelector";
import { AddMemberModal } from "./AddMemberModal";
import { Database } from "@/integrations/supabase/types";

type StoryBookRole = Database["public"]["Enums"]["storybook_role"];

interface Member {
  profile_id: string;
  role: StoryBookRole;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface MemberManagementProps {
  storyBookId: string;
}

export function MemberManagement({ storyBookId }: MemberManagementProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: members, isLoading, refetch } = useQuery({
    queryKey: ["storybook-members", storyBookId],
    queryFn: async () => {
      const { data: currentUser } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("storybook_members")
        .select(`
          profile_id,
          role,
          profiles!storybook_members_profile_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .eq("storybook_id", storyBookId);

      if (error) throw error;
      return data as Member[];
    },
  });

  const handleRoleChange = async (memberId: string, newRole: StoryBookRole) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("storybook_members")
        .update({ role: newRole })
        .eq("storybook_id", storyBookId)
        .eq("profile_id", memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member role updated successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("storybook_members")
        .delete()
        .eq("storybook_id", storyBookId)
        .eq("profile_id", memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member removed successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading members...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Members</h2>
        <AddMemberModal storyBookId={storyBookId} onSuccess={refetch} />
      </div>

      <div className="space-y-4">
        {members?.map((member) => (
          <div
            key={member.profile_id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <div className="font-medium">
                {member.profiles.first_name} {member.profiles.last_name}
              </div>
              <div className="text-sm text-gray-500">{member.profiles.email}</div>
            </div>
            <div className="flex items-center gap-4">
              <RoleSelector
                value={member.role}
                onChange={(role) => handleRoleChange(member.profile_id, role)}
                disabled={isUpdating}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveMember(member.profile_id)}
              >
                <UserX className="h-4 w-4 text-red-500" />
                <span className="sr-only">Remove member</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}