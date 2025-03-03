
-- Add elevenlabs_voice_id column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS elevenlabs_voice_id TEXT;

-- Add is_personalized column to story_audio table if it doesn't exist
ALTER TABLE public.story_audio ADD COLUMN IF NOT EXISTS is_personalized BOOLEAN DEFAULT FALSE;

-- Make sure we have a storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('story_audio', 'story_audio', true)
ON CONFLICT (id) DO NOTHING;

-- Set public policy for the storage bucket
CREATE POLICY "Public Read Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'story_audio')
  ON CONFLICT DO NOTHING;

CREATE POLICY "Authenticated Users Can Upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'story_audio' AND auth.role() = 'authenticated')
  ON CONFLICT DO NOTHING;
