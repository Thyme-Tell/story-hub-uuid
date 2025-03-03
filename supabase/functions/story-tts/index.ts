
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const elevenLabsApiKey = Deno.env.get("ELEVEN_LABS_API_KEY") || "";
    
    if (!elevenLabsApiKey) {
      throw new Error("ElevenLabs API key is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the request body
    const { storyId, voiceId, usePersonalizedVoice = false } = await req.json();
    console.log("Received request for story:", storyId, "usePersonalizedVoice:", usePersonalizedVoice);

    if (!storyId) {
      throw new Error("Story ID is required");
    }

    // Get the story content
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('content, profiles(id, elevenlabs_voice_id, synthflow_voice_id)')
      .eq('id', storyId)
      .single();

    if (storyError || !story) {
      console.error("Error fetching story:", storyError);
      throw new Error(`Failed to fetch story: ${storyError?.message || "Story not found"}`);
    }

    const content = story.content;
    console.log("Story content length:", content.length);

    // Determine which voice to use
    let selectedVoiceId = "EXAVITQu4vr4xnSDxMaL"; // Default voice (Sarah)
    let isPersonalized = false;
    
    if (usePersonalizedVoice) {
      // Check if user has a personalized voice
      if (story.profiles?.elevenlabs_voice_id) {
        selectedVoiceId = story.profiles.elevenlabs_voice_id;
        isPersonalized = true;
        console.log("Using personalized ElevenLabs voice:", selectedVoiceId);
      } else if (story.profiles?.synthflow_voice_id) {
        selectedVoiceId = story.profiles.synthflow_voice_id;
        isPersonalized = true;
        console.log("Using personalized Synthflow voice:", selectedVoiceId);
      } else {
        console.log("No personalized voice found, using default voice");
      }
    } else if (voiceId) {
      selectedVoiceId = voiceId;
      console.log("Using specified voice:", selectedVoiceId);
    }

    // Delete any existing audio for this story
    const { error: deleteError } = await supabase
      .from('story_audio')
      .delete()
      .eq('story_id', storyId);
    
    if (deleteError) {
      console.warn("Error deleting existing audio records:", deleteError);
      // Continue anyway, as this shouldn't stop the process
    }

    // Generate audio using ElevenLabs API
    console.log("Generating audio with ElevenLabs, voice:", selectedVoiceId);
    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": elevenLabsApiKey,
        },
        body: JSON.stringify({
          text: content,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      console.error("ElevenLabs API error:", errorText);
      throw new Error(`ElevenLabs API error: ${elevenLabsResponse.status} - ${errorText}`);
    }

    // Get the audio data as a buffer
    const audioBuffer = await elevenLabsResponse.arrayBuffer();
    console.log("Received audio data, size:", audioBuffer.byteLength);

    // Upload the audio file to Supabase Storage
    const fileName = `${storyId}_${Date.now()}.mp3`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('story_audio')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error("Error uploading audio file:", uploadError);
      throw new Error(`Failed to upload audio file: ${uploadError.message}`);
    }

    console.log("Audio file uploaded successfully:", fileName);

    // Get the public URL for the uploaded file
    const { data: publicUrlData } = await supabase
      .storage
      .from('story_audio')
      .getPublicUrl(fileName);

    const audioUrl = publicUrlData.publicUrl;

    // Store the audio information in the database
    const { data: audioData, error: audioInsertError } = await supabase
      .from('story_audio')
      .insert({
        story_id: storyId,
        audio_url: audioUrl,
        audio_type: isPersonalized ? 'personalized' : 'standard',
        playback_count: 0,
      })
      .select()
      .single();

    if (audioInsertError) {
      console.error("Error inserting audio record:", audioInsertError);
      throw new Error(`Failed to store audio record: ${audioInsertError.message}`);
    }

    console.log("Audio record created:", audioData.id);

    // Return the result
    return new Response(
      JSON.stringify({
        success: true,
        audioUrl,
        isPersonalized,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in story-tts function:", error.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
