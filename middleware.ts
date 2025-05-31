// middleware.ts
import NextIntlMiddleware from 'next-intl/middleware';
import { updateSession } from "@/utils/supabase/middleware";
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from "next/server";

const intlMiddleware = NextIntlMiddleware({
  locales: ['en', 'fi'],
  defaultLocale: 'en'
});

export async function middleware(request: NextRequest) {
  // 1. Process i18n first
  const intlResponse = await intlMiddleware(request);
  if (intlResponse) return intlResponse;

  // 2. Create response and Supabase client
  const response = await updateSession(request);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    { auth: { persistSession: false } }
  );

  // 3. Get user session
  const { data: { user } } = await supabase.auth.getUser();

  // 4. Set role cookie (or 'anonymous')
  response.cookies.set('user-role', user ? 'authenticated' : 'anonymous', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 5 // 5 minutes
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json|ico)$).*)"]
};//add matcher to exclude files under folder api