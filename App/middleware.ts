// middleware.ts

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Inicijalni odgovor
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Ažuriramo request kolačiće kako bi ih supabase.auth.getUser() vidio odmah
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // Ključna promjena: Re-inicijaliziramo response s novim request headers
          response = NextResponse.next({
            request,
          })
          
          // Postavljamo kolačiće na novi response objekt
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() je sigurniji od getSession() jer provjerava token na serveru
  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isProjectTracking = pathname.startsWith('/project_tracking')
  const isOnboarding = pathname.startsWith('/onboarding')
  const isAdminRoute = pathname.startsWith('/admin')
  const isAuthRoute = pathname === '/login' || pathname === '/login_company'

  // 1. AKO KORISNIK NIJE PRIJAVLJEN
  if (!user) {
    if (isDashboardRoute || isOnboarding || isAdminRoute) {
      return NextResponse.redirect(new URL('/login_company', request.url))
    }
    if (isProjectTracking) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  // 2. AKO JE KORISNIK PRIJAVLJEN
  const userType = user.user_metadata?.user_type
  const isAdmin = user.user_metadata?.is_admin === true || userType === 'admin'

  // Dodajemo Cache-Control da spriječimo browser da pokazuje staru stranicu nakon odjave
  response.headers.set('Cache-Control', 'no-store, max-age=0')

  if (isAuthRoute) {
    if (isAdmin) return NextResponse.redirect(new URL('/admin', request.url))
    if (userType === 'company') return NextResponse.redirect(new URL('/dashboard', request.url))
    return NextResponse.redirect(new URL('/project_tracking', request.url))
  }

  // ZABRANE (Cross-access prevention)
  if (isAdmin) {
    if (isProjectTracking || isDashboardRoute || isOnboarding) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  if (userType === 'client') {
    if (isDashboardRoute || isOnboarding || isAdminRoute) {
      return NextResponse.redirect(new URL('/project_tracking', request.url))
    }
  }

  if (userType === 'company') {
    if (isProjectTracking || isAdminRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}