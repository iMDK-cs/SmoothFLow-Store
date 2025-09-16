"use client"

import { SessionProvider } from 'next-auth/react'
import { CartProvider } from '@/contexts/CartContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </SessionProvider>
  )
}