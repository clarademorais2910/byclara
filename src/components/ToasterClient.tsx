'use client'
import { Toaster } from 'react-hot-toast'

export default function ToasterClient() {
  return (
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
  )
}
