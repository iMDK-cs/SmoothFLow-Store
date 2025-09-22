import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Simple in-memory rate limiter for basic protection
const rateLimit = new Map<string, { count: number; resetTime: number }>()

function isRateLimited(ip: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now()
  const windowStart = now - windowMs
  
  const current = rateLimit.get(ip)
  
  if (!current || current.resetTime < windowStart) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs })
    return false
  }
  
  if (current.count >= maxRequests) {
    return true
  }
  
  current.count++
  return false
}

// Security headers
function addSecurityHeaders(response: NextResponse) {
  // CSRF Protection
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.moyasar.com https://checkout.moyasar.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.moyasar.com;"
  )
  
  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown'
  
  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    // More restrictive rate limiting for sensitive endpoints
    if (pathname.startsWith('/api/auth/') || 
        pathname.startsWith('/api/payments/') ||
        pathname.startsWith('/api/admin/')) {
      if (isRateLimited(ip, 5, 60000)) { // 5 requests per minute
        return new NextResponse('Too Many Requests', { 
          status: 429,
          headers: {
            'Retry-After': '60'
          }
        })
      }
    } else {
      // General API rate limiting
      if (isRateLimited(ip, 20, 60000)) { // 20 requests per minute
        return new NextResponse('Too Many Requests', { 
          status: 429,
          headers: {
            'Retry-After': '60'
          }
        })
      }
    }
  }
  
  // Admin route protection
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req: request })
    
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
    
    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  // Create response and add security headers
  const response = NextResponse.next()
  return addSecurityHeaders(response)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}