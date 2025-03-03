
// Import required libraries
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// Set CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the request body
    const { storyId, voiceId, usePersonalizedVoice } = await req.json()
    
    // Validate required parameters
    if (!storyId) {
      throw new Error('Story ID is required')
    }

    console.log(`Processing TTS for story: ${storyId}, usePersonalizedVoice: ${usePersonalizedVoice}`)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get story content and profile ID
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('content, profile_id')
      .eq('id', storyId)
      .single()

    if (storyError) {
      throw new Error(`Error fetching story: ${storyError.message}`)
    }
    
    if (!story) {
      throw new Error('Story not found')
    }

    const content = story.content
    const profileId = story.profile_id

    // Determine which voice to use
    let selectedVoiceId = voiceId || 'EXAVITQu4vr4xnSDxMaL' // Default to Sarah if no voice specified
    let isPersonalized = false

    if (usePersonalizedVoice) {
      // Get profile to check for personalized voice
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('elevenlabs_voice_id, synthflow_voice_id')
        .eq('id', profileId)
        .single()

      if (profileError) {
        console.warn(`Error fetching profile: ${profileError.message}`)
        // Continue with default voice
      } else if (profile && profile.elevenlabs_voice_id) {
        console.log(`Using ElevenLabs personalized voice: ${profile.elevenlabs_voice_id}`)
        selectedVoiceId = profile.elevenlabs_voice_id
        isPersonalized = true
      } else if (profile && profile.synthflow_voice_id) {
        console.log(`Profile has Synthflow voice but not ElevenLabs voice. Using default voice.`)
        // Continue with default voice since Synthflow voice can't be used directly
      }
    }

    // Get Eleven Labs API key
    const elevenLabsApiKey = Deno.env.get('ELEVEN_LABS_API_KEY')
    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured')
    }

    // Call Eleven Labs TTS API
    console.log(`Calling ElevenLabs TTS API with voice: ${selectedVoiceId}`)
    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: content,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        }
      }),
    })

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text()
      throw new Error(`ElevenLabs API error: ${ttsResponse.status} - ${errorText}`)
    }

    // Get the audio data
    const audioBuffer = await ttsResponse.arrayBuffer()
    
    // Create a unique filename for the audio
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `story_${storyId}_${timestamp}.mp3`
    
    // Upload the audio to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('story_audio')
      .upload(filename, audioBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
      })
    
    if (uploadError) {
      throw new Error(`Failed to upload audio: ${uploadError.message}`)
    }
    
    // Get the public URL for the uploaded audio
    const { data: { publicUrl } } = supabase
      .storage
      .from('story_audio')
      .getPublicUrl(filename)
    
    // Save audio info to database
    const audioType = isPersonalized ? 'personalized' : 'standard'
    const { error: dbError } = await supabase
      .from('story_audio')
      .upsert({
        story_id: storyId,
        audio_url: publicUrl,
        audio_type: audioType,
        playback_count: 0,
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'story_id',
      })
    
    if (dbError) {
      throw new Error(`Failed to save audio info: ${dbError.message}`)
    }
    
    console.log(`Successfully generated audio for story: ${storyId}`)
    
    // Return success response
    return new Response(
      JSON.stringify({
        audioUrl: publicUrl,
        isPersonalized: isPersonalized,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in story-tts function:', error.message)
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
