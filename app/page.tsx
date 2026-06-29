'use client'

import { useState, useRef, useEffect } from 'react'

const LANGUAGES = ['COBOL', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'SQL', 'Java', 'PHP']

const ACTIONS = [
  { id: 'explain', label: '💡 Expliquer', description: 'Comprendre le code', color: '#1f6feb' },
  { id: 'debug', label: '🐛 Déboguer', description: 'Trouver les bugs', color: '#da3633' },
  { id: 'improve', label: '⚡ Améliorer', description: 'Optimiser', color: '#238636' },
  { id: 'tests', label: '🧪 Tests', description: 'Générer les tests', color: '#8957e5' },
  { id: 'document', label: '📝 Documenter', description: 'JSDoc / COBOL', color: '#e3b341' },
]

const EXAMPLES: Record<string, string> = {
  COBOL: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. CALCUL-TVA.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-PRIX-HT    PIC 9(7)V99 VALUE 0.
       01 WS-TAUX-TVA   PIC 9(3)V99 VALUE 20.
       01 WS-MONTANT-TVA PIC 9(7)V99 VALUE 0.
       01 WS-PRIX-TTC   PIC 9(7)V99 VALUE 0.
       PROCEDURE DIVISION.
           MOVE 1500.00 TO WS-PRIX-HT
           COMPUTE WS-MONTANT-TVA = WS-PRIX-HT * WS-TAUX-TVA / 100
           COMPUTE WS-PRIX-TTC = WS-PRIX-HT + WS-MONTANT-TVA
           DISPLAY "Prix HT : " WS-PRIX-HT
           DISPLAY "TVA : " WS-MONTANT-TVA
           DISPLAY "Prix TTC : " WS-PRIX-TTC
           STOP RUN.`,
  JavaScript: `function fetchUserData(userId) {
  fetch('/api/users/' + userId)
    .then(response => response.json())
    .then(data => {
      console.log(data)
      document.getElementById('name').innerHTML = data.name
    })
}
fetchUserData(123)`,
  TypeScript: `interface User {
  id: number
  name: string
  email: string
}

async function getUsers(): Promise<User[]> {
  const response = await fetch('/api/users')
  const data = response.json()
  return data
}`,
  SQL: `SELECT u.name, COUNT(o.id) as total_orders, SUM(o.amount) as total_amount
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.created_at > '2024-01-01'
GROUP BY u.id
HAVING total_orders > 5
ORDER BY total_amount`,
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

type Tab = 'analyze' | 'chat'

export default function Home() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('COBOL')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeAction, setActiveAction] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('analyze')
  const [detecting, setDetecting] = useState(false)

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const detectLanguage = async () => {
    if (!code.trim()) return
    setDetecting(true)
    try {
      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (data.language) setLanguage(data.language)
    } catch {}
    finally { setDetecting(false) }
  }

  const analyze = async (action: string) => {
    if (!code.trim()) { setError('Veuillez coller du code avant de lancer une analyse.'); return }
    setLoading(true); setActiveAction(action); setResult(''); setError('')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, action, language }),
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else setResult(data.result)
    } catch { setError('Erreur de connexion.') }
    finally { setLoading(false) }
  }

  const sendChat = async () => {
    if (!chatInput.trim() || !code.trim()) return
    const userMessage: ChatMessage = { role: 'user', content: chatInput }
    const newMessages = [...chatMessages, userMessage]
    setChatMessages(newMessages)
    setChatInput('')
    setChatLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, code, language }),
      })
      const data = await res.json()
      if (data.result) {
        setChatMessages([...newMessages, { role: 'assistant', content: data.result }])
      }
    } catch {}
    finally { setChatLoading(false) }
  }

  const loadExample = () => {
    const example = EXAMPLES[language] || EXAMPLES.JavaScript
    setCode(example); setResult(''); setError(''); setChatMessages([])
  }

  const s = {
    bg: '#0d1117', bg2: '#161b22', border: '#30363d',
    text: '#e6edf3', muted: '#8b949e', blue: '#1f6feb',
  }

  return (
    <main style={{ minHeight: '100vh', background: s.bg, color: s.text, fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header style={{ background: s.bg2, borderBottom: `1px solid ${s.border}`, padding: '12px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: s.blue, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: s.text }}>Code Assistant AI</div>
              <div style={{ fontSize: 11, color: s.muted }}>Powered by Claude · Anthropic</div>
            </div>
          </div>
          <a href="https://github.com/Lou-Duquenoy/code-assistant-ai" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 12px', borderRadius: 6, background: '#21262d', color: s.muted, border: `1px solid ${s.border}`, textDecoration: 'none' }}>
            ⭐ GitHub
          </a>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: s.text, margin: '0 0 8px' }}>Analysez votre code avec l&apos;IA</h1>
          <p style={{ color: s.muted, fontSize: 14, margin: 0 }}>COBOL, JavaScript, TypeScript et plus — Expliquer, Déboguer, Améliorer, Tester, Documenter</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Colonne gauche */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Sélecteur langage + détection auto */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {LANGUAGES.map(lang => (
                <button key={lang} onClick={() => setLanguage(lang)}
                  style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontFamily: 'monospace', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', background: language === lang ? s.blue : '#21262d', color: language === lang ? '#fff' : s.muted, border: `1px solid ${language === lang ? s.blue : s.border}` }}>
                  {lang}
                </button>
              ))}
              <button onClick={detectLanguage} disabled={detecting || !code.trim()}
                style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: '#21262d', color: detecting ? s.muted : '#e3b341', border: `1px solid ${s.border}`, opacity: !code.trim() ? 0.4 : 1 }}>
                {detecting ? '⏳ Détection...' : '🔍 Détecter auto'}
              </button>
            </div>

            {/* Textarea */}
            <div style={{ position: 'relative' }}>
              <textarea value={code} onChange={e => setCode(e.target.value)}
                placeholder={`Collez votre code ${language} ici...`}
                style={{ width: '100%', height: 300, padding: 14, fontSize: 13, fontFamily: 'JetBrains Mono, monospace', background: s.bg2, border: `1px solid ${s.border}`, borderRadius: 8, color: s.text, outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}
                spellCheck={false}
              />
              <button onClick={loadExample}
                style={{ position: 'absolute', top: 10, right: 10, fontSize: 11, padding: '3px 8px', borderRadius: 4, background: '#21262d', color: s.muted, border: `1px solid ${s.border}`, cursor: 'pointer' }}>
                Exemple
              </button>
            </div>

            {/* Boutons action */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {ACTIONS.map(action => (
                <button key={action.id} onClick={() => { setTab('analyze'); analyze(action.id) }} disabled={loading}
                  style={{ padding: '10px 6px', borderRadius: 8, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: action.color, color: '#fff', fontSize: 11, fontWeight: 500, opacity: loading ? 0.5 : 1, transition: 'opacity 0.15s' }}>
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{action.label.split(' ')[0]}</div>
                  <div style={{ fontWeight: 600 }}>{action.label.split(' ')[1]}</div>
                  <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{action.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Colonne droite */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: `1px solid ${s.border}`, marginBottom: 0 }}>
              {(['analyze', 'chat'] as Tab[]).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ padding: '10px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: 'transparent', border: 'none', color: tab === t ? s.text : s.muted, borderBottom: tab === t ? `2px solid ${s.blue}` : '2px solid transparent', marginBottom: -1 }}>
                  {t === 'analyze' ? '📊 Analyse' : '💬 Conversation'}
                </button>
              ))}
            </div>

            {/* Panel Analyse */}
            {tab === 'analyze' && (
              <div style={{ background: s.bg2, border: `1px solid ${s.border}`, borderTop: 'none', borderRadius: '0 0 8px 8px', padding: 16, minHeight: 400, flex: 1 }}>
                {loading && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 350, gap: 12 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: s.blue, animation: 'bounce 0.6s infinite', animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                    <p style={{ color: s.muted, fontSize: 13 }}>Claude analyse votre code...</p>
                  </div>
                )}
                {!loading && error && (
                  <div style={{ padding: 12, borderRadius: 6, background: '#3d1c1c', border: '1px solid #f85149', color: '#f85149', fontSize: 13 }}>⚠️ {error}</div>
                )}
                {!loading && result && (
                  <div>
                    <div style={{ fontSize: 12, color: s.muted, marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${s.border}` }}>
                      {ACTIONS.find(a => a.id === activeAction)?.label} — {language}
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.7, color: s.text, whiteSpace: 'pre-wrap' }}>{result}</div>
                  </div>
                )}
                {!loading && !result && !error && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 350, gap: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 40 }}>🤖</div>
                    <p style={{ fontWeight: 600, color: s.text, margin: 0 }}>Prêt à analyser</p>
                    <p style={{ color: s.muted, fontSize: 12, margin: 0 }}>Collez du code, choisissez une action</p>
                  </div>
                )}
              </div>
            )}

            {/* Panel Chat */}
            {tab === 'chat' && (
              <div style={{ background: s.bg2, border: `1px solid ${s.border}`, borderTop: 'none', borderRadius: '0 0 8px 8px', display: 'flex', flexDirection: 'column', minHeight: 400 }}>
                {!code.trim() ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8, padding: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 32 }}>💬</div>
                    <p style={{ color: s.muted, fontSize: 13, margin: 0 }}>Collez du code à gauche pour démarrer une conversation</p>
                  </div>
                ) : (
                  <>
                    <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 340 }}>
                      {chatMessages.length === 0 && (
                        <div style={{ textAlign: 'center', color: s.muted, fontSize: 13, marginTop: 40 }}>
                          <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
                          Posez une question sur votre code {language}
                        </div>
                      )}
                      {chatMessages.map((msg, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                          <div style={{
                            maxWidth: '85%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                            background: msg.role === 'user' ? s.blue : '#21262d',
                            color: s.text, fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                            border: msg.role === 'assistant' ? `1px solid ${s.border}` : 'none'
                          }}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div style={{ display: 'flex', gap: 4, padding: '8px 14px', background: '#21262d', borderRadius: '12px 12px 12px 4px', width: 'fit-content', border: `1px solid ${s.border}` }}>
                          {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: s.muted, animation: 'bounce 0.6s infinite', animationDelay: `${i * 0.15}s` }} />)}
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    <div style={{ padding: '12px 16px', borderTop: `1px solid ${s.border}`, display: 'flex', gap: 8 }}>
                      <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat() } }}
                        placeholder="Posez une question sur ce code..."
                        style={{ flex: 1, padding: '8px 12px', borderRadius: 6, background: '#21262d', border: `1px solid ${s.border}`, color: s.text, fontSize: 13, outline: 'none' }}
                      />
                      <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()}
                        style={{ padding: '8px 16px', borderRadius: 6, background: s.blue, color: '#fff', border: 'none', fontSize: 13, cursor: chatLoading || !chatInput.trim() ? 'not-allowed' : 'pointer', opacity: chatLoading || !chatInput.trim() ? 0.5 : 1 }}>
                        Envoyer
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <footer style={{ marginTop: 32, paddingTop: 20, borderTop: `1px solid ${s.border}`, textAlign: 'center', fontSize: 12, color: s.muted }}>
          Développé par{' '}
          <a href="https://github.com/Lou-Duquenoy" style={{ color: '#58a6ff' }}>Lou Duquenoy</a>
          {' '}· Next.js · TypeScript · API Claude (Anthropic)
        </footer>
      </div>

      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
        * { box-sizing: border-box }
        textarea:focus { border-color: #1f6feb !important }
        input:focus { border-color: #1f6feb !important }
        ::-webkit-scrollbar { width: 6px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px }
      `}</style>
    </main>
  )
}
