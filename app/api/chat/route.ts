import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { messages, code, language } = await request.json()
    if (!messages || !code) return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })

    const systemPrompt = `Tu es un expert en développement logiciel, spécialisé en ${language}. L'utilisateur travaille sur ce code :

\`\`\`${language}
${code}
\`\`\`

Réponds à ses questions en français de façon précise et pédagogique. Si tu proposes du code, formate-le correctement.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    })

    const result = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ result })
  } catch (error) {
    console.error('Erreur chat:', error)
    return NextResponse.json({ error: 'Erreur lors de la conversation' }, { status: 500 })
  }
}
