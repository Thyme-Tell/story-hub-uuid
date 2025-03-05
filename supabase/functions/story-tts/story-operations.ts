
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// Type definition for story data
type Story = {
  content: string;
  title: string | null;
};

/**
 * Fetches story content from the database
 */
export async function fetchStoryContent(storyId: string): Promise<Story> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Get story content
  console.log('Fetching story content...');
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('content, title')
    .eq('id', storyId)
    .single()

  if (storyError) {
    console.error('Story fetch error:', storyError)
    throw new Error(storyError?.message || 'Story not found')
  }

  if (!story) {
    throw new Error('Story not found')
  }

  if (!story.content || story.content.trim() === '') {
    throw new Error('Story content is empty')
  }

  console.log(`Story found: ${story.title || 'Untitled'}, Content length: ${story.content.length}`)
  
  return story
}
