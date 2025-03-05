import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditStoryBookModal } from "@/components/storybook/EditStoryBookModal";
import { StoryList } from "@/components/storybook/StoryList";
import { MemberManagement } from "@/components/storybook/MemberManagement";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

export default function StoryBook() {
  const { id } = useParams();

  const { data: storybook, isLoading, refetch } = useQuery({
    queryKey: ["storybook", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("storybooks")
        .select(`
          *,
          storybook_members!inner (
            profile_id,
            role,
            profiles!storybook_members_profile_id_fkey (
              first_name,
              last_name
            )
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (!storybook) {
    return <div className="container mx-auto p-6">Storybook not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{storybook.title}</h1>
          <div className="flex items-center gap-2">
            <EditStoryBookModal storybook={storybook} onSuccess={refetch} />
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/storybooks/${storybook.id}/settings`}>
                <Settings className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Link>
            </Button>
          </div>
        </div>
        {storybook.description && (
          <p className="text-gray-600 mt-2">{storybook.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <StoryList storyBookId={storybook.id} />
        </div>

        <div className="space-y-8">
          <MemberManagement storyBookId={storybook.id} />
        </div>
      </div>
    </div>
  );
}