
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const elevenlabsApiKey = Deno.env.get('ELEVEN_LABS_API_KEY') ?? '';
    if (!elevenlabsApiKey) {
      throw new Error('Missing ElevenLabs API key');
    }

    // Parse request
    const { storyId, usePersonalizedVoice = false } = await req.json();

    if (!storyId) {
      throw new Error('Missing storyId parameter');
    }

    console.log(`Generating audio for story ID: ${storyId}, personalized: ${usePersonalizedVoice}`);

    // Get story content
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('content, profile_id')
      .eq('id', storyId)
      .maybeSingle();

    if (storyError || !story) {
      throw new Error(`Failed to get story: ${storyError?.message || 'Not found'}`);
    }

    let elevenlabsVoiceId = "21m00Tcm4TlvDq8ikWAM"; // Default voice ID
    let isPersonalized = false;

    if (usePersonalizedVoice) {
      // Get profile for personalized voice
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('elevenlabs_voice_id')
        .eq('id', story.profile_id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
        throw new Error(`Failed to get profile: ${profileError.message}`);
      }

      // Check if profile has ElevenLabs voice ID
      if (profile?.elevenlabs_voice_id) {
        elevenlabsVoiceId = profile.elevenlabs_voice_id;
        isPersonalized = true;
        console.log(`Using personalized voice ID: ${elevenlabsVoiceId}`);
      } else {
        console.log("No personalized voice found, using default voice");
      }
    }

    // Remove any existing audio for this story
    const { error: deleteError } = await supabase
      .from('story_audio')
      .delete()
      .eq('story_id', storyId)
      .eq('is_personalized', isPersonalized);

    if (deleteError) {
      console.error(`Failed to delete existing audio: ${deleteError.message}`);
      // Continue anyway, not critical
    }

    // Call ElevenLabs API
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${elevenlabsVoiceId}`;
    const headers = {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': elevenlabsApiKey,
    };

    const body = JSON.stringify({
      text: story.content,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      }
    });

    console.log(`Sending request to ElevenLabs for voice ID: ${elevenlabsVoiceId}`);
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioData = await response.arrayBuffer();
    
    // Get a unique filename
    const timestamp = new Date().getTime();
    const filename = `${storyId}_${timestamp}${isPersonalized ? '_personalized' : ''}.mp3`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('story_audio')
      .upload(filename, audioData, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error(`Failed to upload audio: ${uploadError.message}`);
      throw new Error(`Failed to upload audio: ${uploadError.message}`);
    }

    console.log(`Successfully uploaded audio: ${filename}`);

    // Create a public URL for the audio
    const { data: { publicUrl } } = supabase
      .storage
      .from('story_audio')
      .getPublicUrl(filename);

    // Save the audio URL to the database
    const { data: audioRecord, error: audioError } = await supabase
      .from('story_audio')
      .insert({
        story_id: storyId,
        audio_url: publicUrl,
        is_personalized: isPersonalized,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (audioError) {
      console.error(`Failed to save audio record: ${audioError.message}`);
      throw new Error(`Failed to save audio record: ${audioError.message}`);
    }

    console.log(`Successfully created audio record with URL: ${publicUrl}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        audioUrl: publicUrl,
        isPersonalized
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error(`Error generating audio: ${error.message}`);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  }
});

