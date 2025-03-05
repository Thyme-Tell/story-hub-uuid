
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

/**
 * Saves audio metadata to the database
 */
export async function saveAudioMetadata(
  storyId: string,
  audioUrl: string,
  voiceId: string
): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('Saving audio metadata to database...')
  const { error: metadataError } = await supabase
    .from('story_audio')
    .insert({
      story_id: storyId,
      audio_url: audioUrl,
      voice_id: voiceId,
      playback_count: 0,
      audio_type: 'standard'
    })

  if (metadataError) {
    console.error('Metadata save error:', metadataError)
    throw new Error(`Failed to save audio metadata: ${metadataError.message}`)
  }

  console.log('Audio metadata saved successfully')
}
