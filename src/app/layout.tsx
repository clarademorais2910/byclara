import type { Metadata } from 'next'
import { Pacifico, Nunito } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'By Clara — Pulseiras de Miçangas',
  description: 'Pulseiras de miçangas artesanais e personalizadas. Encomende a sua!',
  keywords: ['pulseiras', 'miçangas', 'artesanal', 'personalizado', 'By Clara'],
  openGraph: {
    title: 'By Clara — Pulseiras de Miçangas',
    description: 'Pulseiras artesanais e personalizadas com amor ✨',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${pacifico.variable} ${nunito.variable}`}>
      <body className="font-body bg-clara-fundo text-clara-texto antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: '1rem',
              fontFamily: 'Nunito, sans-serif',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  )
}
