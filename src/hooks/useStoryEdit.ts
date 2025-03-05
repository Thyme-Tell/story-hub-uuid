
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type EditOption = 'shorten' | 'expand' | 'clarity' | 'tone' | 'grammar';

interface EditStoryParams {
  text: string;
  options: EditOption[];
  toneStyle?: string;
}

export const useStoryEdit = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editStory = async ({ text, options, toneStyle }: EditStoryParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('story-edit', {
        body: { text, options, toneStyle },
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      return data?.editedText || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to edit story';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    editStory,
    isLoading,
    error,
  };
};
