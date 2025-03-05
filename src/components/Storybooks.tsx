import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Plus, Book, Printer } from "lucide-react";
import { useRPIPrint } from "@/hooks/useRPIPrint";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Storybook {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

const Storybooks = ({ profileId }: { profileId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const { createOrder } = useRPIPrint();

  const { data: storybooks, refetch } = useQuery({
    queryKey: ["storybooks", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("storybooks")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleCreateStorybook = async () => {
    try {
      const { error } = await supabase.from("storybooks").insert({
        profile_id: profileId,
        title,
        description: description || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Storybook created successfully",
      });

      setIsOpen(false);
      setTitle("");
      setDescription("");
      refetch();
    } catch (error) {
      console.error("Error creating storybook:", error);
      toast({
        title: "Error",
        description: "Failed to create storybook",
        variant: "destructive",
      });
    }
  };

  const handlePrintStorybook = async (storybook: Storybook) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .maybeSingle();

      if (!profile) {
        throw new Error("Profile not found");
      }

      const orderData = {
        destination: {
          name: `${profile.first_name} ${profile.last_name}`,
          address1: "123 Main St", // This should come from user input
          city: "New York", // This should come from user input
          state: "NY", // This should come from user input
          postal: "10001", // This should come from user input
          country: "US",
          phone: profile.phone_number,
          email: profile.email || "",
        },
        orderItems: [
          {
            sku: "STORYBOOK-HARDCOVER",
            quantity: 1,
            retailPrice: "29.99",
            itemDescription: `Storybook: ${storybook.title}`,
            product: {
              coverUrl: "https://example.com/cover.pdf", // This should be generated
              gutsUrl: "https://example.com/content.pdf", // This should be generated
            },
          },
        ],
      };

      await createOrder.mutateAsync(orderData);
    } catch (error) {
      console.error("Error printing storybook:", error);
      toast({
        title: "Error",
        description: "Failed to create print order",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Storybooks</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              New Storybook
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Storybook</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateStorybook} disabled={!title}>
                Create Storybook
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {storybooks?.map((storybook: Storybook) => (
          <div
            key={storybook.id}
            className="p-4 rounded-lg border bg-card text-card-foreground"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  {storybook.title}
                </h3>
                {storybook.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {storybook.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Created {new Date(storybook.created_at).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePrintStorybook(storybook)}
                className="h-8 w-8"
              >
                <Printer className="h-4 w-4" />
                <span className="sr-only">Print storybook</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Storybooks;