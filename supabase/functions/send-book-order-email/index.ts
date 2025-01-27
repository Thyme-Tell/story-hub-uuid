import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookOrderRequest {
  profileId: string;
  userEmail: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profileId, userEmail } = await req.json() as BookOrderRequest;
    
    const LOOPS_API_KEY = Deno.env.get('LOOPS_API_KEY');
    if (!LOOPS_API_KEY) {
      throw new Error('LOOPS_API_KEY is not set');
    }

    // Send email using Loops
    const response = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOOPS_API_KEY}`,
      },
      body: JSON.stringify({
        transactionalId: 'cm6f1iwei00hzr8a0co3pef2t',
        email: 'mia@narrastory.com,richard@narrastory.com',
        dataVariables: {
          userId: profileId,
          userEmail: userEmail,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Loops API error:', errorData);
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Email sent successfully:', data);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});