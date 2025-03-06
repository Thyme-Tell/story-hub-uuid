
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CoverData } from "@/components/cover/CoverEditor";

export function useCoverData(profileId: string) {
  const [coverData, setCoverData] = useState<CoverData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCoverData() {
      if (!profileId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("book_covers")
          .select("cover_data")
          .eq("profile_id", profileId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setCoverData(data.cover_data as CoverData);
        } else {
          setCoverData(null);
        }
      } catch (err) {
        console.error("Error fetching cover data:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCoverData();
  }, [profileId]);

  const saveCoverData = async (newCoverData: CoverData) => {
    if (!profileId) return;

    try {
      // Check if a record already exists
      const { data: existingRecord } = await supabase
        .from("book_covers")
        .select("id")
        .eq("profile_id", profileId)
        .maybeSingle();

      let result;
      
      if (existingRecord) {
        // Update existing record
        result = await supabase
          .from("book_covers")
          .update({ cover_data: newCoverData })
          .eq("profile_id", profileId);
      } else {
        // Insert new record
        result = await supabase
          .from("book_covers")
          .insert({ profile_id: profileId, cover_data: newCoverData });
      }

      if (result.error) throw result.error;

      setCoverData(newCoverData);
      return true;
    } catch (err) {
      console.error("Error saving cover data:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save cover data",
      });
      return false;
    }
  };

  return {
    coverData,
    isLoading,
    error,
    saveCoverData,
  };
}
