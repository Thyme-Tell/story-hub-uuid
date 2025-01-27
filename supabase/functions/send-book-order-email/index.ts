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
    console.log('Received request:', { profileId, userEmail });
    
    const LOOPS_API_KEY = Deno.env.get('LOOPS_API_KEY');
    if (!LOOPS_API_KEY) {
      throw new Error('LOOPS_API_KEY is not set');
    }

    // Send email using Loops - now sending to each recipient separately
    const recipients = ['mia@narrastory.com', 'richard@narrastory.com'];
    
    const responses = await Promise.all(recipients.map(async (recipient) => {
      const loopsPayload = {
        transactionalId: 'cm6f1iwei00hzr8a0co3pef2t',
        email: recipient,
        dataVariables: {
          userId: profileId,
          userEmail: userEmail,
        },
      };

      console.log('Sending request to Loops for recipient:', recipient);

      const response = await fetch('https://app.loops.so/api/v1/transactional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LOOPS_API_KEY}`,
        },
        body: JSON.stringify(loopsPayload),
      });

      const responseText = await response.text();
      console.log('Loops API response for', recipient, ':', {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
      });

      if (!response.ok) {
        throw new Error(`Loops API error for ${recipient}: ${response.status} ${response.statusText} - ${responseText}`);
      }

      return responseText;
    }));

    return new Response(
      JSON.stringify({ success: true, responses }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
      }
    );
  } catch (error) {
    console.error('Error in send-book-order-email:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
      }
    );
  }
});