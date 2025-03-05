
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

/**
 * Ensures the story-audio bucket exists and has correct permissions
 */
async function ensureStorageBucketExists() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Check if bucket exists
  console.log('Checking if story-audio bucket exists...')
  const { data: buckets } = await supabase
    .storage
    .listBuckets()
    
  const bucketExists = buckets?.some(bucket => bucket.name === 'story-audio')
  
  if (!bucketExists) {
    console.log('Creating story-audio bucket')
    const { error: createBucketError } = await supabase
      .storage
      .createBucket('story-audio', {
        public: true,
      })
      
    if (createBucketError) {
      console.error('Failed to create storage bucket:', createBucketError)
      throw new Error(`Failed to create storage bucket: ${createBucketError.message}`)
    }
  }
}

/**
 * Uploads audio file to Supabase storage and returns the public URL
 */
export async function uploadAudioFile(
  filename: string, 
  audioBuffer: ArrayBuffer
): Promise<string> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Ensure storage bucket exists
  await ensureStorageBucketExists()
  
  console.log(`Uploading audio to storage with filename: ${filename}`)
  const { error: uploadError } = await supabase
    .storage
    .from('story-audio')
    .upload(filename, audioBuffer, {
      contentType: 'audio/mpeg',
      cacheControl: '3600',
    })

  if (uploadError) {
    console.error('Storage upload error:', uploadError)
    throw new Error(`Failed to upload audio: ${uploadError.message}`)
  }

  console.log('Audio uploaded successfully')

  // Get the public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from('story-audio')
    .getPublicUrl(filename)

  console.log(`Public URL generated: ${publicUrl}`)
  
  return publicUrl
}
