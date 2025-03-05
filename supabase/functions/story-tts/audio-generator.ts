
/**
 * Generates audio using ElevenLabs API
 */
export async function generateAudio(
  story: { content: string; title: string | null },
  voiceId: string
): Promise<ArrayBuffer> {
  // Check if ELEVEN_LABS_API_KEY is set
  const elevenLabsApiKey = Deno.env.get('ELEVEN_LABS_API_KEY')
  if (!elevenLabsApiKey) {
    throw new Error('ELEVEN_LABS_API_KEY environment variable is not set')
  }

  // Prepare text for TTS
  const text = `${story.title ? story.title + ". " : ""}${story.content}`
  console.log(`Text prepared for TTS, length: ${text.length} characters`)

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
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
  )

  if (!response.ok) {
    let errorText = '';
    try {
      errorText = await response.text();
    } catch (e) {
      errorText = 'Failed to read error response';
    }
    console.error('ElevenLabs API error:', response.status, errorText)
    throw new Error(`Failed to generate audio: ${response.status} ${errorText}`)
  }

  console.log('Audio generated successfully')

  // Get the audio data
  const audioBuffer = await response.arrayBuffer()
  console.log(`Received audio buffer of size: ${audioBuffer.byteLength} bytes`)
  
  return audioBuffer
}
