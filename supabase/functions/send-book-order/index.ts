import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  profileId: string;
  email: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { profileId, email }: RequestBody = await req.json();

    const LOOPS_API_KEY = Deno.env.get('LOOPS_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOOPS_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch user profile information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', profileId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    // Send email using Loops
    const response = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOOPS_API_KEY}`,
      },
      body: JSON.stringify({
        transactionalId: 'cm6f2c1qz023i125irpb4aq2u',
        email: email,
        dataVariables: {
          'firstName-1': profile.first_name,
          'lastName-1': profile.last_name,
          'profileId-1': profileId,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Loops API error:', errorText);
      throw new Error('Failed to send email through Loops');
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});