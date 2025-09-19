"use client"

import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface CartItem {
  id: string
  serviceId: string
  optionId?: string
  quantity: number
  service: {
    id: string
    title: string
    basePrice: number
    image?: string
    icon?: string
  }
  option?: {
    id: string
    title: string
    price: number
  }
}

interface Cart {
  id: string
  items: CartItem[]
}

interface CartState {
  cart: Cart | null
  loading: boolean
  error: string | null
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: Cart }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'ADD_ITEM'; payload: { serviceId: string; optionId?: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_CART':
      return { ...state, cart: action.payload, loading: false, error: null }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'ADD_ITEM':
      return { ...state, loading: false } // Don't set loading to true for add
    case 'REMOVE_ITEM':
      return { ...state, loading: false } // Don't set loading to true for remove
    case 'UPDATE_QUANTITY':
      return { ...state, loading: false } // Don't set loading to true for update
    case 'CLEAR_CART':
      return { ...state, cart: null, loading: false, error: null }
    default:
      return state
  }
}

interface CartContextType {
  state: CartState
  addToCart: (serviceId: string, optionId?: string, quantity?: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getTotalPrice: () => number
  getItemCount: () => number
  lastAddedItem: string | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const [lastAddedItem, setLastAddedItem] = useState<string | null>(null)
  const { data: session } = useSession()

  const fetchCart = useCallback(async () => {
    // Don't make API calls if user is not logged in
    if (!session?.user) {
      return
    }
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await fetch('/api/cart')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.status}`)
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response received:', text)
        throw new Error('Server returned non-JSON response')
      }
      
      const data = await response.json()
      // Debug log removed for performance
      dispatch({ type: 'SET_CART', payload: data.cart })
    } catch (error) {
      console.error('Fetch cart error:', error) // Debug log
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' })
    }
  }, [session])

  // Fetch cart on mount
  useEffect(() => {
    if (session?.user) {
      fetchCart()
    } else {
      // Clear cart when user logs out
      dispatch({ type: 'CLEAR_CART' })
    }
  }, [session, fetchCart])

  const addToCart = async (serviceId: string, optionId?: string, quantity = 1) => {
    // Don't make API calls if user is not logged in
    if (!session?.user) {
      throw new Error('User must be logged in to add items to cart')
    }
    
    // Optimistic update - show loading immediately
    dispatch({ type: 'SET_LOADING', payload: true })
    
    // Set last added item for animation (immediate feedback)
    setLastAddedItem(serviceId)
    setTimeout(() => setLastAddedItem(null), 2000)
    
    try {
      const startTime = Date.now()
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ serviceId, optionId, quantity }),
      })
      
      const executionTime = Date.now() - startTime
      // Performance log removed
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to add item to cart')
      }
      
      const result = await response.json()
      // Success log removed
      
      // Refresh cart in background (non-blocking)
      fetchCart().catch(error => {
        console.error('Background cart refresh failed:', error)
      })
      
    } catch (error) {
      console.error('Add to cart error:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add item to cart' })
      
      // Retry mechanism for network errors
      if (error instanceof Error && error.message.includes('fetch')) {
        // Retry log removed
        setTimeout(() => {
          addToCart(serviceId, optionId, quantity)
        }, 1000)
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const removeFromCart = async (itemId: string) => {
    try {
      dispatch({ type: 'REMOVE_ITEM', payload: itemId })
      
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to remove item from cart')
      }
      
      await fetchCart()
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart' })
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } })
      
      // Implementation for updating quantity
      await fetchCart()
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update quantity' })
    }
  }

  const clearCart = async () => {
    try {
      dispatch({ type: 'CLEAR_CART' })
      
      const response = await fetch('/api/cart/clear', {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to clear cart')
      }
      
      await fetchCart()
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart' })
    }
  }

  const getTotalPrice = () => {
    if (!state.cart?.items) return 0
    
    return state.cart.items.reduce((total, item) => {
      const price = item.option ? item.option.price : item.service.basePrice
      return total + (price * item.quantity)
    }, 0)
  }

  const getItemCount = () => {
    if (!state.cart?.items) return 0
    
    return state.cart.items.reduce((count, item) => count + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart, 
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getItemCount,
        lastAddedItem,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}