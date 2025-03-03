
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useStoryAudio = (storyId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const { toast } = useToast();

  const generateAudio = useCallback(async (options?: { voiceId?: string, usePersonalizedVoice?: boolean }) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Generating audio for story ${storyId}, usePersonalizedVoice: ${options?.usePersonalizedVoice}`);
      
      // Generate the audio via the edge function
      // The edge function now handles deleting previous audio records
      const { data, error } = await supabase.functions.invoke('story-tts', {
        body: { 
          storyId, 
          voiceId: options?.voiceId,
          usePersonalizedVoice: options?.usePersonalizedVoice 
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        setError(error.message);
        toast({
          title: "Error",
          description: `Failed to generate audio: ${error.message}`,
          variant: "destructive",
        });
        return { error: error.message };
      }
      
      if (data.error) {
        console.error("TTS processing error:", data.error);
        setError(data.error);
        toast({
          title: "Error",
          description: `Failed to generate audio: ${data.error}`,
          variant: "destructive",
        });
        return { error: data.error };
      }

      console.log("TTS response:", data);
      
      if (!data.audioUrl) {
        const msg = "No audio URL in response";
        console.error(msg);
        setError(msg);
        return { error: msg };
      }
      
      setAudioUrl(data.audioUrl);
      setIsPersonalized(data.isPersonalized || false);
      
      toast({
        title: "Success",
        description: data.isPersonalized 
          ? "Audio generated with storyteller's voice" 
          : "Audio generated successfully",
      });
      
      return { success: true };
    } catch (err) {
      console.error('Error generating audio:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to generate audio",
        variant: "destructive",
      });
      return { error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [storyId, toast]);

  useEffect(() => {
    const fetchExistingAudio = async () => {
      try {
        const { data, error } = await supabase
          .from('story_audio')
          .select('audio_url, audio_type')
          .eq('story_id', storyId)
          .maybeSingle();

        if (error) {
          // If error is about missing column, just continue without setting values
          if (error.message && error.message.includes("column 'audio_type' does not exist")) {
            console.warn("The audio_type column doesn't exist yet, using standard values");
            // Check if data exists and has an audio_url despite the column error
            if (data && typeof data === 'object' && 'audio_url' in data) {
              setAudioUrl(data.audio_url as string);
              setIsPersonalized(false); // Default to standard voice
            }
          } else {
            throw error;
          }
        } else if (data) {
          setAudioUrl(data.audio_url);
          setIsPersonalized(data.audio_type === 'personalized');
        }
      } catch (err) {
        console.error('Error fetching audio:', err);
      }
    };

    fetchExistingAudio();
  }, [storyId]);

  const updatePlaybackStats = useCallback(async () => {
    try {
      // Get current playback count
      const { data: currentStats } = await supabase
        .from('story_audio')
        .select('playback_count')
        .eq('story_id', storyId)
        .maybeSingle();

      // Only update if the record exists
      if (currentStats) {
        await supabase
          .from('story_audio')
          .update({
            playback_count: (currentStats.playback_count || 0) + 1,
            last_played_at: new Date().toISOString(),
          })
          .eq('story_id', storyId);
      }
    } catch (err) {
      console.error('Error updating playback stats:', err);
    }
  }, [storyId]);

  return {
    isLoading,
    audioUrl,
    isPersonalized,
    error,
    generateAudio,
    updatePlaybackStats,
  };
};
