
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { storyId, voiceId = "21m00Tcm4TlvDq8ikWAM", usePersonalizedVoice = false } = await req.json()
    console.log(`Processing TTS request for story ${storyId}, usePersonalizedVoice: ${usePersonalizedVoice}`)

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get story content
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('content, title, profile_id')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      throw new Error('Story not found')
    }

    // Prepare text for TTS
    const text = `${story.title ? story.title + ". " : ""}${story.content}`

    // Check if we should use personalized voice
    let synthflowVoiceId = null;
    if (usePersonalizedVoice) {
      // Check if the user has a Synthflow voice ID
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('synthflow_voice_id')
        .eq('id', story.profile_id)
        .single();

      if (!profileError && profileData?.synthflow_voice_id) {
        synthflowVoiceId = profileData.synthflow_voice_id;
        console.log(`Using personalized voice ID: ${synthflowVoiceId}`);
      } else {
        console.log('No personalized voice found, falling back to default voice');
      }
    }

    let audioResponse;
    let audioType = 'standard';
    let voiceUsed = voiceId;

    // If we have a Synthflow voice ID, use it with ElevenLabs
    if (synthflowVoiceId) {
      try {
        audioType = 'personalized';
        console.log("Requesting Synthflow voice redirect")
        
        // Call Synthflow to use the personalized voice
        const synthflowResponse = await fetch(
          `https://api.synthflow.ai/v1/voices/${synthflowVoiceId}/elevenlabs-redirect`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SYNTHFLOW_API_KEY')}`,
            },
          }
        );

        if (!synthflowResponse.ok) {
          throw new Error(`Synthflow API error: ${synthflowResponse.status}`);
        }

        const synthflowData = await synthflowResponse.json();
        console.log("Received voice ID from Synthflow:", synthflowData.voice_id);
        
        // Use the provided voice ID from Synthflow with ElevenLabs
        const elevenlabsVoiceId = synthflowData.voice_id;
        voiceUsed = elevenlabsVoiceId;
        
        // Generate audio using ElevenLabs API with the Synthflow voice
        console.log("Requesting audio generation with personalized voice from ElevenLabs")
        audioResponse = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${elevenlabsVoiceId}`,
          {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': Deno.env.get('ELEVEN_LABS_API_KEY')!,
            },
            body: JSON.stringify({
              text,
              model_id: "eleven_multilingual_v2",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
              },
            }),
          }
        );
        
        if (!audioResponse.ok) {
          const errorData = await audioResponse.text();
          console.error("ElevenLabs personalized voice error:", errorData);
          throw new Error(`ElevenLabs error with personalized voice: ${audioResponse.status}`);
        }
        
      } catch (error) {
        console.error('Error using personalized voice:', error);
        // Fall back to default voice if personalized voice fails
        audioType = 'standard';
        audioResponse = null;
      }
    }

    // If personalized voice failed or wasn't requested, use standard voice
    if (!audioResponse) {
      console.log(`Using standard voice with ID: ${voiceId}`);
      audioResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': Deno.env.get('ELEVEN_LABS_API_KEY')!,
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
        }
      );
      
      if (!audioResponse.ok) {
        const errorData = await audioResponse.text();
        console.error("ElevenLabs standard voice error:", errorData);
        throw new Error(`ElevenLabs error with standard voice: ${audioResponse.status}`);
      }
    }

    // Get the audio data
    console.log("Processing audio response")
    const audioBuffer = await audioResponse.arrayBuffer();
    console.log(`Received audio buffer of size: ${audioBuffer.byteLength} bytes`);

    // Upload to Supabase Storage
    const fileName = `${storyId}-${Date.now()}.mp3`;
    const { error: uploadError, data: uploadData } = await supabase
      .storage
      .from('story-audio')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error('Failed to upload audio');
    }

    console.log("Audio file uploaded successfully");

    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('story-audio')
      .getPublicUrl(fileName);

    // Save audio metadata
    const { error: metadataError } = await supabase
      .from('story_audio')
      .insert({
        story_id: storyId,
        audio_url: publicUrl,
        voice_id: voiceUsed,
        audio_type: audioType,
        playback_count: 0,
      });

    if (metadataError) {
      console.error("Metadata error:", metadataError);
      throw new Error('Failed to save audio metadata');
    }

    console.log(`Success! Audio type: ${audioType}, URL: ${publicUrl}`);
    return new Response(
      JSON.stringify({ 
        audioUrl: publicUrl,
        isPersonalized: audioType === 'personalized'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
