
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CoverData, DEFAULT_COVER_DATA } from "@/components/cover/CoverTypes";
import { Json } from "@/integrations/supabase/types";
import Cookies from "js-cookie";

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
        console.log('Fetching cover data for profile:', profileId);
        
        // First, try to fetch existing cover data
        const { data, error } = await supabase
          .from('book_covers')
          .select('cover_data')
          .eq('profile_id', profileId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching cover data:', error);
          throw error;
        }

        console.log('Received cover data:', data);
        
        if (data) {
          setCoverData(data.cover_data as CoverData);
        } else {
          // If no cover data exists yet, create a new record with default data
          console.log('Creating new cover data with defaults');
          
          try {
            // Use Edge Function to create initial cover data
            const response = await fetch(`${supabase.supabaseUrl}/functions/v1/save-cover-data`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabase.supabaseKey}`
              },
              body: JSON.stringify({
                profileId: profileId,
                coverData: DEFAULT_COVER_DATA
              })
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              console.error('Error response from edge function:', errorData);
              throw new Error(errorData.error || 'Failed to create cover data');
            }
            
            const newData = await response.json();
            console.log('Created new cover data via edge function:', newData);
            
            if (newData.data) {
              setCoverData(newData.data.cover_data as CoverData);
            }
          } catch (edgeFnError) {
            console.error('Edge function error:', edgeFnError);
            throw edgeFnError;
          }
        }
      } catch (err) {
        console.error("Error in fetchCoverData:", err);
        setError(err as Error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load cover data",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchCoverData();
  }, [profileId]);

  const saveCoverData = async (newCoverData: CoverData) => {
    if (!profileId) return false;

    try {
      console.log('Saving cover data:', newCoverData);
      
      // Use Edge Function to save cover data (bypasses RLS)
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/save-cover-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          profileId: profileId,
          coverData: newCoverData
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from edge function:', errorData);
        throw new Error(errorData.error || 'Failed to save cover data');
      }
      
      console.log('Cover data saved successfully');
      setCoverData(newCoverData);
      return true;
    } catch (err) {
      console.error("Error in saveCoverData:", err);
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
