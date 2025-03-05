export interface StoryMediaItem {
  id: string;
  file_path: string;
  content_type: string;
  caption: string | null;
  file_name: string;
  story_id?: string | null;
}