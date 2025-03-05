
-- Make sure we have a storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('story-audio', 'story-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Set public policy for the storage bucket
INSERT INTO storage.policies (name, definition, check, action, schema, table, roles)
VALUES (
  'Public Read Access',
  'bucket_id = ''story-audio''',
  'true',
  'SELECT',
  'storage',
  'objects',
  '{anon, authenticated}'
) ON CONFLICT DO NOTHING;

INSERT INTO storage.policies (name, definition, check, action, schema, table, roles)
VALUES (
  'Authenticated Users Can Upload',
  'bucket_id = ''story-audio''',
  'true',
  'INSERT',
  'storage',
  'objects',
  '{authenticated}'
) ON CONFLICT DO NOTHING;
