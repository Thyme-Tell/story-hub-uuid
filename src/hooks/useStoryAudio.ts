import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useStoryAudio = (storyId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateAudio = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Requesting audio for story:', storyId);
      
      // Make a single call to the edge function that will either:
      // 1. Return an existing audio URL if it exists
      // 2. Generate a new audio file if one doesn't exist
      const { data, error: invokeError } = await supabase.functions.invoke('story-tts', {
        body: { storyId }
      });

      if (invokeError) {
        console.error('Function invocation error:', invokeError);
        throw new Error(`Function invocation error: ${invokeError.message}`);
      }
      
      if (!data) {
        throw new Error('No data returned from edge function');
      }

      console.log('Audio response:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
        
        toast({
          title: "Success",
          description: "Audio ready for playback",
        });
        
        return data.audioUrl;
      } else {
        throw new Error('No audio URL returned from edge function');
      }
    } catch (err: any) {
      console.error('Error with audio:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: `Failed to get audio: ${err.message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [storyId, toast]);

  useEffect(() => {
    const fetchExistingAudio = async () => {
      try {
        // Simply call the same function that handles both generating and checking
        // But don't display toast messages for initial loading
        setIsLoading(true);
        const result = await supabase.functions.invoke('story-tts', {
          body: { storyId }
        });
        
        if (result.data?.audioUrl) {
          setAudioUrl(result.data.audioUrl);
        }
      } catch (err) {
        console.error('Error checking for existing audio:', err);
        // Don't display errors during initial check
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingAudio();
  }, [storyId]);

  const updatePlaybackStats = useCallback(async () => {
    try {
      console.log('Updating playback stats for story:', storyId);
      
      // Get current playback count
      const { data: currentStats, error: statsError } = await supabase
        .from('story_audio')
        .select('playback_count')
        .eq('story_id', storyId)
        .maybeSingle();

      if (statsError) {
        console.error('Error fetching playback stats:', statsError);
        return; // Don't throw, just log and continue
      }

      // Only update if the record exists
      if (currentStats) {
        const newCount = (currentStats.playback_count || 0) + 1;
        console.log('Incrementing playback count to:', newCount);
        
        const { error: updateError } = await supabase
          .from('story_audio')
          .update({
            playback_count: newCount,
            last_played_at: new Date().toISOString(),
          })
          .eq('story_id', storyId);
          
        if (updateError) {
          console.error('Error updating playback stats:', updateError);
        }
      }
    } catch (err) {
      console.error('Error updating playback stats:', err);
    }
  }, [storyId]);

  return {
    isLoading,
    audioUrl,
    error,
    generateAudio,
    updatePlaybackStats,
  };
};
