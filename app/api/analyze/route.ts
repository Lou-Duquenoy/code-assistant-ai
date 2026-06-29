import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PROMPTS = {
  explain: (code: string, lang: string) =>
    `Tu es un expert en développement logiciel. Explique ce code ${lang} de façon claire et pédagogique en français. Décris ce qu'il fait, comment il fonctionne, et ses points clés.\n\nCode :\n\`\`\`${lang}\n${code}\n\`\`\``,
  debug: (code: string, lang: string) =>
    `Tu es un expert en développement logiciel. Analyse ce code ${lang} et identifie tous les bugs, erreurs potentielles, problèmes de performance ou de sécurité. Pour chaque problème trouvé, explique-le et propose une correction. Réponds en français.\n\nCode :\n\`\`\`${lang}\n${code}\n\`\`\``,
  improve: (code: string, lang: string) =>
    `Tu es un expert en développement logiciel. Propose des améliorations concrètes pour ce code ${lang} : lisibilité, performance, bonnes pratiques, patterns recommandés. Fournis le code amélioré avec les explications. Réponds en français.\n\nCode :\n\`\`\`${lang}\n${code}\n\`\`\``,
  tests: (code: string, lang: string) =>
    `Tu es un expert en développement logiciel et en tests. Génère des tests unitaires complets pour ce code ${lang}. Couvre les cas nominaux, les cas limites et les cas d'erreur. Utilise les conventions de test standard pour ce langage. Réponds en français avec le code de test complet.\n\nCode :\n\`\`\`${lang}\n${code}\n\`\`\``,
  document: (code: string, lang: string) =>
    `Tu es un expert en développement logiciel. Génère la documentation complète pour ce code ${lang}. ${lang === 'COBOL' ? 'Ajoute des commentaires COBOL en-tête de programme, de section et de paragraphe selon les standards IBM.' : 'Ajoute des commentaires JSDoc/TSDoc complets pour chaque fonction, paramètre, type de retour et exception possible.'} Fournis le code complet avec la documentation intégrée. Réponds en français.\n\nCode :\n\`\`\`${lang}\n${code}\n\`\`\``,
}

export async function POST(request: NextRequest) {
  try {
    const { code, action, language } = await request.json()
    if (!code || !action || !language) return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    const prompt = PROMPTS[action as keyof typeof PROMPTS]
    if (!prompt) return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt(code, language) }],
    })
    const result = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ result })
  } catch (error) {
    console.error('Erreur API Claude:', error)
    return NextResponse.json({ error: "Erreur lors de l'analyse" }, { status: 500 })
  }
}
