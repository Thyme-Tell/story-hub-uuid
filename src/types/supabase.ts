
export type Story = {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
  share_token: string | null;
};

export type StoryMedia = {
  id: string;
  story_id: string;
  file_path: string;
  file_name: string;
  content_type: string;
  created_at: string;
  caption: string | null;
};

export type Member = {
  profile_id: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
};
