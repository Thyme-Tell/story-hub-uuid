
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { generateAudio } from "./audio-generator.ts"
import { saveAudioMetadata } from "./database-operations.ts"
import { uploadAudioFile } from "./storage-operations.ts"
import { fetchStoryContent } from "./story-operations.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// Standard voice ID to use for all stories
const STANDARD_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // ElevenLabs premium voice

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Received request to generate audio');
    const { storyId } = await req.json()

    if (!storyId) {
      throw new Error('Story ID is required')
    }

    console.log(`Processing audio request for story: ${storyId}`)

    // Check for existing audio first
    console.log('Checking for existing audio...')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { data: existingAudio } = await supabase
      .from('story_audio')
      .select('audio_url')
      .eq('story_id', storyId)
      .maybeSingle()

    if (existingAudio?.audio_url) {
      console.log(`Found existing audio: ${existingAudio.audio_url}`)
      return new Response(
        JSON.stringify({ audioUrl: existingAudio.audio_url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // No existing audio found, generate new audio
    console.log('No existing audio found, generating new audio...')
    
    // Fetch story content from database
    const story = await fetchStoryContent(storyId)
    
    // Generate audio using ElevenLabs API
    console.log(`Calling ElevenLabs API with standard voice ID: ${STANDARD_VOICE_ID}`)
    const audioBuffer = await generateAudio(story, STANDARD_VOICE_ID)
    
    // Upload to Supabase Storage
    const filename = `${storyId}-${Date.now()}.mp3`
    const publicUrl = await uploadAudioFile(filename, audioBuffer)
    
    // Save audio metadata
    await saveAudioMetadata(storyId, publicUrl, STANDARD_VOICE_ID)

    return new Response(
      JSON.stringify({ audioUrl: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error.message, error.stack)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
