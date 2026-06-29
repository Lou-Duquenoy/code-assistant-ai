import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    if (!code) return NextResponse.json({ error: 'Code manquant' }, { status: 400 })
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: `Détecte le langage de programmation de ce code. Réponds UNIQUEMENT avec le nom du langage parmi cette liste exacte : COBOL, JavaScript, TypeScript, Node.js, Python, SQL, Java, PHP. Un seul mot, rien d'autre.\n\nCode :\n${code.substring(0, 500)}`
      }],
    })
    const detected = message.content[0].type === 'text' ? message.content[0].text.trim() : 'JavaScript'
    return NextResponse.json({ language: detected })
  } catch {
    return NextResponse.json({ language: 'JavaScript' })
  }
}
