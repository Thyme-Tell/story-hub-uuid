
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

type EditOption = 'shorten' | 'expand' | 'clarity' | 'tone' | 'grammar'

interface EditRequest {
  text: string
  options: EditOption[]
  toneStyle?: string // Only required when option includes 'tone'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { text, options, toneStyle }: EditRequest = await req.json()
    console.log('Received edit request:', { text, options, toneStyle })

    if (!text || !options || options.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text and at least one option are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Build the system prompt based on selected options
    let systemPrompt = 'You are an expert editor. Edit the provided text according to these instructions:'
    const instructions: string[] = []

    if (options.includes('shorten')) {
      instructions.push('Condense the text while preserving key elements and tone')
    }
    if (options.includes('expand')) {
      instructions.push('Add more descriptive details to enhance the narrative depth')
    }
    if (options.includes('clarity')) {
      instructions.push('Simplify complex sentences and improve readability while maintaining meaning')
    }
    if (options.includes('tone') && toneStyle) {
      instructions.push(`Adjust the tone to be more ${toneStyle} while preserving the story's essence`)
    }
    if (options.includes('grammar')) {
      instructions.push('Correct any grammatical or spelling errors')
    }

    systemPrompt += ' ' + instructions.join('. ') + '.'
    systemPrompt += ' Maintain the original voice and style where possible.'

    console.log('Making request to OpenAI API');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.7,
      }),
    })

    const responseText = await response.text()
    let data
    
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('Failed to parse response:', responseText)
      throw new Error('Invalid response from AI service')
    }

    if (!response.ok) {
      console.error('AI service error:', data)
      throw new Error(data.error?.message || 'AI service error')
    }

    const editedText = data.choices?.[0]?.message?.content
    if (!editedText) {
      throw new Error('No edited text received from AI service')
    }

    return new Response(
      JSON.stringify({ editedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in story-edit function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.details || 'No additional details available'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
