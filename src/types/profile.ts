
export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
}

export interface ProfileData {
  id: string;
  first_name: string;
  last_name: string;
  created_at: string;
  synthflow_voice_id: string | null;
  elevenlabs_voice_id: string | null;
}
