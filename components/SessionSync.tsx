// components/SessionSync.tsx
'use client';
import { useEffect } from 'react';
import { useGetIdentity } from "@refinedev/core";

interface AuthIdentity {
  id: string;
  role?: string;
}

export function SessionSync() {
  const { data: identity } = useGetIdentity<AuthIdentity>();

  useEffect(() => {
    const syncRole = async () => {
      try {
        // For client-side permission checks, use an API route instead
        const res = await fetch('/api/get-role');
        const { role } = await res.json();
        
        const finalRole = role || 'anonymous';
        
        localStorage.setItem('user-role', finalRole);
        document.cookie = `user-role=${finalRole}; path=/; sameSite=lax; ${
          process.env.NODE_ENV === 'production' ? 'secure;' : ''
        } max-age=${60 * 30}`;
      } catch (error) {
        console.error("Role sync failed:", error);
      }
    };

    if (typeof window !== 'undefined') {
      syncRole();
    }
  }, [identity]);

  return null;
}