import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Code Assistant AI — Powered by Claude',
  description: 'Analysez, déboguez et améliorez votre code grâce à l\'IA Claude d\'Anthropic',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
