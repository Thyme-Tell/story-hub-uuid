
-- Add elevenlabs_voice_id column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS elevenlabs_voice_id TEXT;

-- Make sure we have a storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('story_audio', 'story_audio', true)
ON CONFLICT (id) DO NOTHING;

-- Set public policy for the storage bucket
CREATE POLICY "Public Read Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'story_audio');

CREATE POLICY "Authenticated Users Can Upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'story_audio' AND auth.role() = 'authenticated');
