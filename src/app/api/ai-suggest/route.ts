import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

interface SuggestionRequest {
  style?: string
  color?: string
  material?: string
  handleType?: string
  size?: string
  print?: string
}

export async function POST(request: NextRequest) {
  try {
    const data: SuggestionRequest = await request.json()
    
    const zai = await ZAI.create()
    
    const prompt = `You are a professional bag designer assistant for Madhav World Bags Industry. Based on the user's current selections, suggest complementary design choices.

Current selections:
- Style: ${data.style || 'Not selected'}
- Color: ${data.color || 'Not selected'}
- Material: ${data.material || 'Not selected'}
- Handle Type: ${data.handleType || 'Not selected'}
- Size: ${data.size || 'Not selected'}
- Print: ${data.print || 'Not selected'}

Please provide suggestions in the following JSON format only (no markdown, no explanation):
{
  "colorSuggestions": ["color1", "color2", "color3"],
  "materialSuggestions": ["material1", "material2"],
  "handleSuggestions": ["handle1", "handle2"],
  "styleMatches": ["style1", "style2"],
  "printSuggestions": ["print1", "print2"],
  "reasoning": "Brief explanation of why these combinations work well together"
}

Available options for reference:
- Styles: Tote Bag, Shoulder Bag, Clutch, Backpack, Handbag, Crossbody
- Colors: Classic Black, Rich Brown, Tan, Navy Blue, Bold Red, Soft Pink, Forest Green, Natural Beige, Slate Grey, Pure White, Maroon, Royal Purple
- Materials: Genuine Leather, Vegan Leather, Canvas, Nylon, Suede, Non-Woven
- Handles: Double Handle, Single Handle, Crossbody Strap, Loop Handle, Chain Strap, No Handle (Clutch)
- Sizes: Small (20x15x8 cm), Medium (30x22x12 cm), Large (40x30x15 cm), Extra Large (50x35x20 cm)
- Prints: No Print, Logo Print, Pattern, Embossed

Only suggest from the available options above. Make suggestions that would complement the user's current selections.`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a professional bag designer assistant. You only respond with valid JSON, no markdown formatting or explanations outside the JSON structure.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const responseText = completion.choices[0]?.message?.content || ''
    
    // Parse the JSON response
    let suggestions
    try {
      // Remove any potential markdown code blocks
      const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim()
      suggestions = JSON.parse(cleanedResponse)
    } catch {
      // If parsing fails, return default suggestions
      suggestions = {
        colorSuggestions: ['Classic Black', 'Rich Brown', 'Tan'],
        materialSuggestions: ['Genuine Leather', 'Canvas'],
        handleSuggestions: ['Double Handle', 'Crossbody Strap'],
        styleMatches: ['Tote Bag', 'Shoulder Bag'],
        printSuggestions: ['No Print', 'Logo Print'],
        reasoning: 'Classic combinations that work well for most bag styles.'
      }
    }

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('Error generating AI suggestions:', error)
    return NextResponse.json({
      colorSuggestions: ['Classic Black', 'Rich Brown', 'Tan'],
      materialSuggestions: ['Genuine Leather', 'Canvas'],
      handleSuggestions: ['Double Handle', 'Crossbody Strap'],
      styleMatches: ['Tote Bag', 'Shoulder Bag'],
      printSuggestions: ['No Print', 'Logo Print'],
      reasoning: 'Classic combinations that work well for most bag styles.'
    })
  }
}
