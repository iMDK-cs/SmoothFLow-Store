"use client"

import React, { createContext, useContext, useReducer, useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

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
      return { ...state, loading: false }
    case 'REMOVE_ITEM':
      return { ...state, loading: false }
    case 'UPDATE_QUANTITY':
      return { ...state, loading: false }
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
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pendingRequestsRef = useRef<Set<string>>(new Set())

  const fetchCart = useCallback(async () => {
    if (!session?.user) {
      return
    }
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await fetch('/api/cart')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.status}`)
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response received:', text)
        throw new Error('Server returned non-JSON response')
      }
      
      const data = await response.json()
      console.log('Fetched cart data:', data)
      dispatch({ type: 'SET_CART', payload: data.cart })
    } catch (error) {
      console.error('Fetch cart error:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' })
    }
  }, [session])

  useEffect(() => {
    if (session?.user) {
      fetchCart()
    } else {
      dispatch({ type: 'CLEAR_CART' })
    }
  }, [session, fetchCart])

  const debouncedApiCall = useCallback(async (serviceId: string, optionId?: string, quantity = 1) => {
    const requestKey = `${serviceId}-${optionId || 'null'}-${quantity}`
    
    if (pendingRequestsRef.current.has(requestKey)) {
      console.log('Request already pending, skipping...')
      return
    }
    
    pendingRequestsRef.current.add(requestKey)
    
    try {
      const startTime = Date.now()
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ serviceId, optionId, quantity }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      const executionTime = Date.now() - startTime
      console.log(`Add to cart API took ${executionTime}ms`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to add item to cart')
      }
      
      const result = await response.json()
      console.log('Add to cart success:', result)
      
      fetchCart().catch(error => {
        console.error('Background cart refresh failed:', error)
      })
      
    } catch (error) {
      console.error('Add to cart error:', error)
      
      if (state.cart) {
        const rollbackItems = state.cart.items.filter(item => 
          !(item.serviceId === serviceId && item.optionId === optionId && item.id.startsWith('temp-'))
        )
        dispatch({ type: 'SET_CART', payload: { ...state.cart, items: rollbackItems } })
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        dispatch({ type: 'SET_ERROR', payload: 'Request timeout - please try again' })
        toast.error('انتهت مهلة الطلب - يرجى المحاولة مرة أخرى')
      } else {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add item to cart' })
        toast.error('فشل في الإضافة للسلة')
      }
    } finally {
      pendingRequestsRef.current.delete(requestKey)
    }
  }, [state.cart, fetchCart, dispatch])

  const addToCart = useCallback(async (serviceId: string, optionId?: string, quantity = 1) => {
    if (!session?.user) {
      throw new Error('User must be logged in to add items to cart')
    }
    
    setLastAddedItem(serviceId)
    setTimeout(() => setLastAddedItem(null), 1500)
    
    const optimisticItem = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      serviceId,
      optionId,
      quantity,
      service: {
        id: serviceId,
        title: 'جاري الإضافة...',
        basePrice: 0,
        image: undefined,
        icon: undefined
      },
      option: optionId ? {
        id: optionId,
        title: 'جاري الإضافة...',
        price: 0
      } : undefined
    }
    
    if (state.cart) {
      const existingItemIndex = state.cart.items.findIndex(
        item => item.serviceId === serviceId && item.optionId === optionId
      )
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...state.cart.items]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        }
        dispatch({ type: 'SET_CART', payload: { ...state.cart, items: updatedItems } })
      } else {
        dispatch({ type: 'SET_CART', payload: { ...state.cart, items: [...state.cart.items, optimisticItem] } })
      }
    }
    
    toast.success('تمت الإضافة للسلة ✓', {
      duration: 1500,
      position: 'bottom-center',
      style: {
        background: '#10b981',
        color: '#fff',
        fontSize: '14px',
      }
    })
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    debounceTimerRef.current = setTimeout(() => {
      debouncedApiCall(serviceId, optionId, quantity)
    }, 300)
  }, [session, state.cart, debouncedApiCall, dispatch])

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
      toast.error('فشل في حذف العنصر')
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } })
      
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, quantity }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update quantity')
      }
      
      await fetchCart()
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update quantity' })
      toast.error('فشل في تحديث الكمية')
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
      toast.error('فشل في تفريغ السلة')
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