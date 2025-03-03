
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

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
    const { profileId } = await req.json()
    
    if (!profileId) {
      throw new Error('Profile ID is required')
    }

    console.log(`Starting voice transfer process for profile: ${profileId}`)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Fetch Synthflow voice ID from the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('synthflow_voice_id')
      .eq('id', profileId)
      .single()

    if (profileError) {
      throw new Error(`Error fetching profile: ${profileError.message}`)
    }

    if (!profile.synthflow_voice_id) {
      throw new Error('No Synthflow voice ID found for this profile')
    }

    const synthflowVoiceId = profile.synthflow_voice_id
    console.log(`Found Synthflow voice ID: ${synthflowVoiceId}`)

    // 2. Get conversation data from Synthflow
    const synthflowApiKey = Deno.env.get('SYNTHFLOW_API_KEY')
    if (!synthflowApiKey) {
      throw new Error('Synthflow API key not configured')
    }

    console.log('Fetching conversation data from Synthflow')
    const synthflowResponse = await fetch(`https://api.synthflow.com/api/v1/voices/${synthflowVoiceId}/export`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${synthflowApiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!synthflowResponse.ok) {
      const errorText = await synthflowResponse.text()
      throw new Error(`Synthflow API error: ${synthflowResponse.status} - ${errorText}`)
    }

    // Get the audio data from Synthflow
    const synthflowData = await synthflowResponse.json()
    console.log('Successfully fetched voice data from Synthflow')

    // 3. Send data to ElevenLabs
    const elevenLabsApiKey = Deno.env.get('ELEVEN_LABS_API_KEY')
    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured')
    }

    // Prepare form data for ElevenLabs voice cloning
    const formData = new FormData()
    
    // Add voice name
    formData.append('name', `Narra_Storyteller_${profileId.slice(0, 8)}`)
    
    // Add voice description
    formData.append('description', 'Voice transferred from Synthflow for Narra Story')

    // Process and add audio files
    for (let i = 0; i < synthflowData.audio_samples.length; i++) {
      const audioSample = synthflowData.audio_samples[i]
      
      // Convert base64 to blob
      const binaryString = atob(audioSample.audio_data)
      const bytes = new Uint8Array(binaryString.length)
      for (let j = 0; j < binaryString.length; j++) {
        bytes[j] = binaryString.charCodeAt(j)
      }
      
      const audioBlob = new Blob([bytes], { type: 'audio/mp3' })
      formData.append('files', audioBlob, `sample_${i}.mp3`)
    }

    console.log('Sending voice data to ElevenLabs')
    const elevenLabsResponse = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey,
        // No Content-Type header as it's set automatically with FormData
      },
      body: formData,
    })

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text()
      throw new Error(`ElevenLabs API error: ${elevenLabsResponse.status} - ${errorText}`)
    }

    // Get the response with the new voice ID
    const elevenLabsData = await elevenLabsResponse.json()
    const elevenLabsVoiceId = elevenLabsData.voice_id
    
    console.log(`Successfully created voice in ElevenLabs with ID: ${elevenLabsVoiceId}`)

    // 4. Update the profile with the new ElevenLabs voice ID
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ elevenlabs_voice_id: elevenLabsVoiceId })
      .eq('id', profileId)

    if (updateError) {
      throw new Error(`Error updating profile: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Voice successfully transferred from Synthflow to ElevenLabs',
        elevenlabs_voice_id: elevenLabsVoiceId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in transfer-voice function:', error.message)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
